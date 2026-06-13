from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from dependencies import require_manager, get_current_user
from typing import Optional

router = APIRouter(prefix="/customers", tags=["customers"])

class CustomerCreate(BaseModel):
    card_number: str
    cust_surname: str
    cust_name: str
    cust_patronymic: Optional[str] = None
    phone_number: str
    city: Optional[str] = None
    street: Optional[str] = None
    zip_code: Optional[str] = None
    percent: int

class CustomerUpdate(BaseModel):
    cust_surname: Optional[str] = None
    cust_name: Optional[str] = None
    cust_patronymic: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    street: Optional[str] = None
    zip_code: Optional[str] = None
    percent: Optional[int] = None

@router.get("/")
def get_all_customers(surname: Optional[str] = None, percent: Optional[int] = None, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    if surname:
        cur.execute("SELECT * FROM customer_card WHERE cust_surname ILIKE %s ORDER BY cust_surname", (f"%{surname}%",))
    elif percent is not None:
        cur.execute("SELECT * FROM customer_card WHERE percent = %s ORDER BY cust_surname", (percent,))
    else:
        cur.execute("SELECT * FROM customer_card ORDER BY cust_surname")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.get("/{card_number}")
def get_customer(card_number: str, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM customer_card WHERE card_number = %s", (card_number,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Клієнта не знайдено")
    return row

@router.post("/")
def create_customer(data: CustomerCreate, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO customer_card VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (data.card_number, data.cust_surname, data.cust_name, data.cust_patronymic,
             data.phone_number, data.city, data.street, data.zip_code, data.percent)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Картку клієнта додано"}

@router.put("/{card_number}")
def update_customer(card_number: str, data: CustomerUpdate, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """UPDATE customer_card SET cust_surname=%s, cust_name=%s, cust_patronymic=%s,
            phone_number=%s, city=%s, street=%s, zip_code=%s, percent=%s
            WHERE card_number=%s""",
            (data.cust_surname, data.cust_name, data.cust_patronymic,
             data.phone_number, data.city, data.street, data.zip_code,
             data.percent, card_number)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Картку клієнта оновлено"}

@router.delete("/{card_number}")
def delete_customer(card_number: str, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM customer_card WHERE card_number = %s", (card_number,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Картку клієнта видалено"}