from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body
import json
import traceback
from datetime import datetime
from database import db
from routes.auth import UserLogin, authenticate_user, create_access_token

router = APIRouter()

@router.post("/inspect-request")
async def inspect_request(request_data: dict = Body(...)):
    """Debugging endpoint to log and inspect incoming request data"""
    try:
        # Create a response with the received request content
        response = {
            "status": "success",
            "timestamp": str(datetime.utcnow()),
            "received_data": request_data,
            "data_types": {key: str(type(value)) for key, value in request_data.items()},
        }
        
        # Return a detailed response for debugging
        return response
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.post("/verify-login-flow")
async def verify_login_flow(credentials: dict = Body(...)):
    """Debugging endpoint to verify login flow and return detailed diagnostics"""
    try:
        # Extract credentials
        email = credentials.get("email", "")
        password = credentials.get("password", "")
        
        # Basic validation
        response = {
            "status": "analyzing",
            "timestamp": str(datetime.utcnow()),
            "credentials_provided": bool(email and password),
            "debug_info": {
                "email_provided": bool(email),
                "password_provided": bool(password),
                "email_length": len(email),
                "password_length": len(password) if password else 0
            }
        }
        
        # Check if user exists
        user = None
        user_by_email = await db.users.find_one({"email": email})
        user_by_username = await db.users.find_one({"username": email})
        
        response["debug_info"]["user_found_by_email"] = user_by_email is not None
        response["debug_info"]["user_found_by_username"] = user_by_username is not None
        
        if user_by_email:
            user = user_by_email
            response["debug_info"]["search_method"] = "email"
        elif user_by_username:
            user = user_by_username
            response["debug_info"]["search_method"] = "username"
        
        # If no user found
        if not user:
            response["status"] = "failed"
            response["error"] = "User not found"
            return response
        
        # Check password fields
        response["debug_info"]["has_password_field"] = "password" in user
        response["debug_info"]["has_hashed_password_field"] = "hashed_password" in user
        
        # Attempt authentication
        authenticated_user = await authenticate_user(email, password)
        
        response["debug_info"]["authentication_result"] = authenticated_user is not None
        
        if authenticated_user:
            # Authentication successful, create token
            user_id = str(authenticated_user.get("_id"))
            token_data = {
                "sub": user_id,
                "email": authenticated_user.get("email"),
                "role": authenticated_user.get("role", "user"),
            }
            
            # Generate access token
            access_token = create_access_token(token_data)
            
            response["status"] = "success"
            response["message"] = "Authentication successful"
            response["access_token"] = access_token
            response["token_type"] = "bearer"
            response["user_id"] = user_id
            response["username"] = authenticated_user.get("username")
            response["email"] = authenticated_user.get("email")
            response["role"] = authenticated_user.get("role", "user")
        else:
            response["status"] = "failed"
            response["error"] = "Authentication failed"
        
        return response
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.post("/debug-login")
async def debug_login(user_data: UserLogin):
    """Debug login endpoint that returns detailed information about the login process"""
    try:
        # Attempt to authenticate
        user = await authenticate_user(user_data.email, user_data.password)
        
        # Prepare comprehensive response
        response = {
            "status": "success" if user else "failed",
            "authenticated": user is not None,
            "timestamp": str(datetime.utcnow()),
            "request_data": {
                "email": user_data.email,
                "password_length": len(user_data.password) if user_data.password else 0
            }
        }
        
        # Add user data if authenticated
        if user:
            # Get user ID as string from MongoDB ObjectId
            user_id = str(user.get("_id"))
            
            # Remove sensitive fields
            safe_user = {k: v for k, v in user.items() if k not in ["password", "hashed_password"]}
            
            # Create token data
            token_data = {
                "sub": user_id,
                "email": user.get("email"),
                "role": user.get("role", "user"),
            }
            
            # Generate access token
            access_token = create_access_token(token_data)
            
            # Add to response
            response["user"] = safe_user
            response["auth_details"] = {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": user_id,
                "token_data": token_data
            }
        
        return response
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": str(type(e)),
            "traceback": traceback.format_exc()
        }