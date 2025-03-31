from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, EmailStr
from database import db
import bcrypt
from bson import ObjectId
import re
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
import os
import logging
import secrets
from passlib.context import CryptContext
import traceback

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

router = APIRouter()

# JWT Configuration - Properly load and format the secret key
try:
    # Get secret key from environment variables
    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    
    # Ensure the key is a string
    if SECRET_KEY is None:
        logger.warning("JWT_SECRET_KEY not found in .env file - using a temporary key for development")
        SECRET_KEY = secrets.token_hex(32)  # Generate a random key for development
        logger.warning("SECURITY WARNING: Using a temporary secret key. Set JWT_SECRET_KEY in .env for production!")
    
    # Ensure the key is a string
    if not isinstance(SECRET_KEY, str):
        SECRET_KEY = str(SECRET_KEY)
    
    # Log information about the key (without exposing it completely)
    logger.info(f"JWT secret key loaded: {len(SECRET_KEY)} characters")
    logger.info(f"Key prefix: {SECRET_KEY[:5]}...")
except Exception as e:
    logger.error(f"Error setting up SECRET_KEY: {e}")
    raise RuntimeError(f"Could not set up JWT SECRET_KEY. Check your .env file: {str(e)}")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for better user experience

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: str

# New model for admin creation
class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    admin_secret: str  # Secret key to authorize admin creation

# Utility functions
def create_access_token(data: dict, expires_delta: timedelta = None):
    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        
        # Debug the key right before encoding
        logger.info(f"Encoding JWT with key type: {type(SECRET_KEY)}, length: {len(SECRET_KEY)}")
        
        # Encode JWT with the SECRET_KEY
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info("JWT token created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Failed to create JWT token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise credentials_exception

        return user
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error in get_current_user: {e}")
        raise credentials_exception

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    # Validate phone number
    if not re.match(r'^01[0125][0-9]{8}$', user.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Egyptian phone number format"
        )

    # Check existing user
    existing_user = await db.users.find_one({
        "$or": [
            {"email": user.email},
            {"phone": user.phone}
        ]
    })
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or phone already registered"
        )

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode('utf-8'),
        bcrypt.gensalt()
    )

    # Create user document
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password.decode('utf-8'),
        "phone": user.phone,
        "created_at": datetime.utcnow()
    }

    # Insert user
    result = await db.users.insert_one(new_user)
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Return the full token data structure matching the Token model
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(result.inserted_id),
        "username": new_user["username"],
        "email": new_user["email"]
    }

@router.post("/create-admin")
async def create_admin(admin: AdminCreate):
    """
    Create an admin user with a secret key verification
    """
    # Check if the admin secret key is correct
    ADMIN_SECRET = os.getenv("ADMIN_SECRET", "supersecretadminkey")
    if admin.admin_secret != ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret key"
        )
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": admin.email})
    if existing_user:
        # If user exists, update to admin role
        await db.users.update_one(
            {"email": admin.email},
            {"$set": {"role": "admin"}}
        )
        return {"message": "User updated to admin role"}
    
    # Create new admin user
    hashed_password = pwd_context.hash(admin.password)
    new_admin = {
        "email": admin.email,
        "username": admin.email.split('@')[0],
        "hashed_password": hashed_password,
        "role": "admin",
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(new_admin)
    
    return {
        "message": "Admin created successfully",
        "id": str(result.inserted_id)
    }

# Fix the authenticate_user function to handle email/username more flexibly
async def authenticate_user(email: str, password: str):
    """
    Enhanced authenticate user to be more flexible with email/username and password fields
    """
    try:
        # Check both email and username fields
        user = None
        queries = [
            {"email": email},
            {"username": email},
        ]
        
        # Try each query until we find a user
        for query in queries:
            user = await db.users.find_one(query)
            if user:
                logger.info(f"Found user with query: {query}")
                break
        
        if not user:
            logger.warning(f"No user found for: {email}")
            return None
        
        # Check all possible password field names
        password_field = None
        for field_name in ["password", "hashed_password"]:
            if field_name in user and user[field_name]:
                password_field = user[field_name]
                logger.info(f"Using password field: {field_name}")
                break
        
        if not password_field:
            logger.error(f"No password field found for user: {email}")
            return None
        
        # Try multiple verification methods
        is_password_valid = False
        
        # Method 1: bcrypt
        try:
            if password_field.startswith("$2"):
                is_password_valid = bcrypt.checkpw(
                    password.encode('utf-8'), 
                    password_field.encode('utf-8')
                )
                logger.info(f"Bcrypt verification result: {is_password_valid}")
        except Exception as e:
            logger.error(f"Bcrypt verification error: {e}")
        
        # Method 2: passlib
        if not is_password_valid:
            try:
                is_password_valid = pwd_context.verify(password, password_field)
                logger.info(f"Passlib verification result: {is_password_valid}")
            except Exception as e:
                logger.error(f"Passlib verification error: {e}")
        
        # Method 3: direct comparison (for development only)
        if not is_password_valid and os.getenv("DEV_MODE") == "true":
            is_password_valid = (password == password_field)
            logger.warning(f"Using direct password comparison in dev mode: {is_password_valid}")
        
        if not is_password_valid:
            logger.warning(f"Password verification failed for: {email}")
            return None
        
        logger.info(f"Authentication successful for: {email}")
        return user
    except Exception as e:
        logger.error(f"Unexpected error in authenticate_user: {e}")
        logger.error(traceback.format_exc())
        return None

# Add a JSON-based login endpoint that doesn't use OAuth2PasswordRequestForm
@router.post("/json-login")
async def json_login(user_data: UserLogin):
    """Login endpoint that accepts direct JSON with email and password"""
    try:
        # Enhanced logging
        logger.info(f"JSON Login attempt started for: {user_data.email}")
        logger.info(f"Password length: {len(user_data.password) if user_data.password else 0}")
        
        # Authenticate user with email
        user = await authenticate_user(user_data.email, user_data.password)
        
        if not user:
            logger.warning(f"JSON Login failed: Invalid credentials for {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        
        # Get user ID from MongoDB ObjectId
        user_id = str(user.get("_id"))
        
        # Create simplified token data
        token_data = {
            "sub": user_id,  # Change this to use the user ID as subject
            "email": user.get("email"),
            "role": user.get("role", "user"),
        }
        
        # Generate access token
        access_token = create_access_token(token_data)
        
        logger.info(f"JSON Login successful for {user_data.email}, role: {user.get('role', 'user')}")
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "username": user.get("username"),
            "email": user.get("email"),
            "role": user.get("role", "user")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during JSON login: {str(e)}")
        logger.error(f"Error trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

# Modify the login endpoint for additional debugging and better error messages
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Standard OAuth2 login endpoint"""
    try:
        # Log incoming form data for debugging
        logger.info(f"Login request received for: {form_data.username}")
        logger.info(f"Form data type: {type(form_data)}")
        logger.info(f"Form data dict: {form_data.__dict__}")
        
        if not form_data.username or not form_data.password:
            logger.error("Missing username or password in login request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required",
            )
        
        # Authenticate user
        user = await authenticate_user(form_data.username, form_data.password)
        
        if not user:
            logger.warning(f"Login failed for {form_data.username}: Invalid credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user ID as string from MongoDB ObjectId
        user_id = str(user.get("_id"))
        
        # Log user data (excluding sensitive fields)
        safe_user = {k: v for k, v in user.items() if k not in ["password", "hashed_password"]}
        logger.info(f"User authenticated: {safe_user}")
        
        # Create token data
        token_data = {
            "sub": user.get("email"),
            "user_id": user_id,
            "role": user.get("role", "user"),  # Default to "user" if role not set
        }
        
        # Generate access token
        access_token = create_access_token(token_data)
        
        # Log success with role information
        logger.info(f"Login successful for {form_data.username}, role: {user.get('role', 'user')}")
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "username": user.get("username"),
            "email": user.get("email"),
            "role": user.get("role", "user")  # Include role in response
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error during login: {str(e)}")
        logger.error(f"Error trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

# Admin checker example
async def get_current_admin(current_user = Depends(get_current_user)):
    """
    Checks if the current user has admin role
    """
    print(f"Checking admin status for user: {current_user.get('username', 'unknown')}")
    
    # Check if the user has admin role
    if not current_user or not current_user.get("role") == "admin":
        print(f"Access denied: User role is {current_user.get('role', 'none')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires admin privileges"
        )
    print(f"Admin access granted for user: {current_user.get('username', 'unknown')}")
    return current_user

@router.get("/auth-check")
async def auth_check():
    """Check if authentication system is working properly"""
    try:
        # Test creating a token
        test_data = {"test": "data"}
        test_token = create_access_token(test_data)
        
        # Test decoding the token
        decoded = jwt.decode(test_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        return {
            "status": "ok",
            "message": "Authentication module is working properly",
            "secret_key_set": bool(SECRET_KEY),
            "secret_key_prefix": SECRET_KEY[:5] + "..." if SECRET_KEY else None,
            "secret_key_length": len(SECRET_KEY) if SECRET_KEY else 0,
            "secret_key_type": str(type(SECRET_KEY)),
            "test_token": test_token[:20] + "..." if test_token else None,
            "decoded_token": decoded,
            "env_vars_loaded": os.getenv("JWT_SECRET_KEY") is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Authentication module error: {str(e)}",
            "error_type": str(type(e)),
            "secret_key_set": bool(SECRET_KEY),
            "secret_key_type": str(type(SECRET_KEY)),
            "env_vars_loaded": os.getenv("JWT_SECRET_KEY") is not None
        }