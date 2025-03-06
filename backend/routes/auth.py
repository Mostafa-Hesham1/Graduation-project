from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel
from database import db
import bcrypt
from bson import ObjectId
import re
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
import logging
import secrets

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
        # Add debug logging
        logger.info(f"Validating token: {token[:15]}..." if token else "No token provided")
        
        # Check if token is None or empty
        if not token:
            logger.warning("No token provided for authentication")
            raise credentials_exception
            
        # Decode the token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            
            if not user_id:
                logger.warning("Token payload missing 'sub' claim")
                raise credentials_exception
                
            logger.info(f"Token validated for user_id: {user_id}")
        except JWTError as e:
            logger.error(f"JWT decode error: {e}")
            raise credentials_exception
        
        # Find the user in the database
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                logger.warning(f"No user found for id: {user_id}")
                raise credentials_exception
            
            logger.info(f"User authenticated: {user.get('username')}")
            return user
        except Exception as e:
            logger.error(f"Database error: {e}")
            raise credentials_exception
    
    except Exception as e:
        if not isinstance(e, HTTPException):
            logger.error(f"Unexpected error in authentication: {e}")
            raise credentials_exception
        raise

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

@router.post("/login", response_model=Token)
async def login(user: UserLogin, request: Request):
    try:
        logger.info(f"Login attempt for email: {user.email}")
        
        # Find user
        existing_user = await db.users.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        try:
            password_match = bcrypt.checkpw(
                user.password.encode('utf-8'),
                existing_user['password'].encode('utf-8')
            )
            if not password_match:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

        # Generate token with longer expiration
        access_token = create_access_token(
            data={"sub": str(existing_user["_id"])},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        logger.info(f"Login successful for user: {user.email}")
        
        # Return user info along with token for frontend storage
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(existing_user["_id"]),
            "username": existing_user["username"],
            "email": existing_user["email"]
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Admin checker example
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
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