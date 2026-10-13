import re
from typing import Tuple
from app.config import settings

def validate_college_email(email: str) -> Tuple[bool, str]:
    """
    Validates that an email is structurally valid and belongs to an authorized college domain.
    """
    if not email or "@" not in email:
        return False, "Invalid email format."
    
    email = email.strip().lower()
    parts = email.split("@")
    if len(parts) != 2:
        return False, "Invalid email format."
    
    username, domain = parts
    if not username or not domain:
        return False, "Invalid email address."
    
    # Check domain against allowed domains list
    allowed_domains = settings.allowed_domains_list
    
    matched = False
    for allowed in allowed_domains:
        if domain == allowed or domain.endswith("." + allowed):
            matched = True
            break
            
    if not matched:
        allowed_str = ", ".join([f"@{d}" for d in allowed_domains])
        return False, f"Only college emails ({allowed_str}) are allowed to register on SkillSwap."
        
    return True, ""
