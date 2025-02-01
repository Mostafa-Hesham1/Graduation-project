from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import db  # Ensure this is correctly importing your db connection
import bcrypt  # For password hashing
from bson import ObjectId
import re  # For phone number validation
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# User model for registration
class User(BaseModel):
    username: str
    email: str
    password: str
    phone: str  # Add phone number field

# User model for login
class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(user: User):
    # Validate phone number format
    if not re.match(r'^01[0125][0-9]{8}$', user.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number format. Must be an Egyptian phone number.")
    
    # Hash the password
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create a new user document
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password.decode('utf-8'),
        "phone": user.phone  # Store the phone number
    }
    
    # Insert the new user into the database
    result = await db.users.insert_one(new_user)
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/login")
@router.post("/login")
async def login(user: UserLogin):
    print(user)  # Log the incoming user data
    if not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    
    # Check for admin credentials
    if user.email == "mostafa@test.com" and user.password == "123":
        return {"message": "Login successful", "user_id": "admin", "role": "admin"}
    
    existing_user = await db.users.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not bcrypt.checkpw(user.password.encode('utf-8'), existing_user['password'].encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return {"message": "Login successful", "user_id": str(existing_user['_id'])}
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Logic to decode the token and retrieve the user
    # This is a placeholder; implement your actual logic here
    user = await db.users.find_one({"token": token})  # Example logic
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user 