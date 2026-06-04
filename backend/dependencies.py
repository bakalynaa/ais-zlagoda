from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

SECRET_KEY = os.getenv("SECRET_KEY") or "fallback_secret_key"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": payload.get("sub"), "role": payload.get("role")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Невірний токен")

def require_manager(user: dict = Depends(get_current_user)):
    if user["role"] != "Manager":
        raise HTTPException(status_code=403, detail="Доступ лише для менеджера")
    return user

def require_cashier(user: dict = Depends(get_current_user)):
    if user["role"] != "Cashier":
        raise HTTPException(status_code=403, detail="Доступ лише для касира")
    return user