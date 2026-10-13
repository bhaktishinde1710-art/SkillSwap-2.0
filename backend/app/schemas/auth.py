from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegister(BaseModel):
    college_email: str = Field(..., example="aarav.sharma@vit.edu")
    password: str = Field(..., min_length=6, example="Password123!")
    first_name: str = Field(..., min_length=1, max_length=100, example="Aarav")
    last_name: str = Field(..., min_length=1, max_length=100, example="Sharma")
    department: str = Field(..., example="Computer Science")
    year: str = Field(..., example="Third Year")
    college: Optional[str] = "Vishwakarma Institute of Technology (VIT), Pune"

class UserLogin(BaseModel):
    college_email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class ForgotPasswordRequest(BaseModel):
    college_email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

from app.schemas.user import UserResponse
Token.model_rebuild()
