from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from dependencies import require_manager, get_current_user
import bcrypt
from typing import Optional
from datetime import date

router = APIRouter(prefix="/employees", tags=["employees"])

class EmployeeCreate(BaseModel):
    id_employee: str
    empl_surname: str
    empl_name: str
    empl_patronymic: Optional[str] = None
    empl_role: str
    salary: float
    date_of_birth: date
    date_of_start: date
    phone_number: str
    city: str
    street: str
    zip_code: str
    password: str

class EmployeeUpdate(BaseModel):
    empl_surname: Optional[str] = None
    empl_name: Optional[str] = None
    empl_patronymic: Optional[str] = None
    empl_role: Optional[str] = None
    salary: Optional[float] = None
    date_of_birth: Optional[date] = None
    date_of_start: Optional[date] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    street: Optional[str] = None
    zip_code: Optional[str] = None

@router.get("/")
def get_all_employees(user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_employee, empl_surname, empl_name, empl_patronymic, empl_role, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code FROM employee ORDER BY empl_surname")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.get("/cashiers")
def get_cashiers(user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_employee, empl_surname, empl_name, empl_patronymic, phone_number, city, street, zip_code FROM employee WHERE empl_role = 'Cashier' ORDER BY empl_surname")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_employee, empl_surname, empl_name, empl_patronymic, empl_role, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code FROM employee WHERE id_employee = %s", (user["id"],))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row

@router.get("/{id_employee}")
def get_employee(id_employee: str, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_employee, empl_surname, empl_name, phone_number, city, street, zip_code FROM employee WHERE id_employee = %s", (id_employee,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Працівника не знайдено")
    return row

@router.post("/")
def create_employee(data: EmployeeCreate, user=Depends(require_manager)):
    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO employee VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (data.id_employee, data.empl_surname, data.empl_name, data.empl_patronymic,
             data.empl_role, data.salary, data.date_of_birth, data.date_of_start,
             data.phone_number, data.city, data.street, data.zip_code, password_hash)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Працівника додано"}

@router.put("/{id_employee}")
def update_employee(id_employee: str, data: EmployeeUpdate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """UPDATE employee SET empl_surname=%s, empl_name=%s, empl_patronymic=%s,
            empl_role=%s, salary=%s, date_of_birth=%s, date_of_start=%s,
            phone_number=%s, city=%s, street=%s, zip_code=%s
            WHERE id_employee=%s""",
            (data.empl_surname, data.empl_name, data.empl_patronymic,
             data.empl_role, data.salary, data.date_of_birth, data.date_of_start,
             data.phone_number, data.city, data.street, data.zip_code, id_employee)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Працівника оновлено"}

@router.delete("/{id_employee}")
def delete_employee(id_employee: str, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM employee WHERE id_employee = %s", (id_employee,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Працівника видалено"}