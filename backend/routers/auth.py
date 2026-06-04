from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection
import bcrypt
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
SECRET_KEY = os.getenv("SECRET_KEY") or "fallback_secret_key"

router = APIRouter()

ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    id_employee: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id_employee, empl_role, password_hash FROM employee WHERE id_employee = %s",
        (data.id_employee,)
    )
    employee = cur.fetchone()
    cur.close()
    conn.close()

    if not employee:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")

    id_employee, empl_role, password_hash = employee

    if not password_hash or not bcrypt.checkpw(data.password.encode(), password_hash.encode()):
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")

    token = jwt.encode(
        {"sub": id_employee, "role": empl_role},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {"token": token, "role": empl_role}