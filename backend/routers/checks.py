from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from dependencies import require_manager, require_cashier, get_current_user
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/checks", tags=["checks"])

class SaleItem(BaseModel):
    UPC: str
    product_number: int

class CheckCreate(BaseModel):
    card_number: Optional[str] = None
    items: List[SaleItem]

@router.get("/")
def get_checks(
    cashier_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user=Depends(get_current_user)
):
    conn = get_connection()
    cur = conn.cursor()

    if user["role"] == "Cashier":
        cur.execute(
            """SELECT * FROM "Check" WHERE id_employee = %s
            AND (%s::timestamp IS NULL OR print_date >= %s)
            AND (%s::timestamp IS NULL OR print_date <= %s)
            ORDER BY print_date DESC""",
            (user["id"], date_from, date_from, date_to, date_to)
        )
    else:
        if cashier_id:
            cur.execute(
                """SELECT * FROM "Check" WHERE id_employee = %s
                AND (%s::timestamp IS NULL OR print_date >= %s)
                AND (%s::timestamp IS NULL OR print_date <= %s)
                ORDER BY print_date DESC""",
                (cashier_id, date_from, date_from, date_to, date_to)
            )
        else:
            cur.execute(
                """SELECT * FROM "Check"
                WHERE (%s::timestamp IS NULL OR print_date >= %s)
                AND (%s::timestamp IS NULL OR print_date <= %s)
                ORDER BY print_date DESC""",
                (date_from, date_from, date_to, date_to)
            )

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.get("/{check_number}")
def get_check(check_number: str, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM "Check" WHERE check_number = %s', (check_number,))
    check = cur.fetchone()
    if not check:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Чек не знайдено")
    cur.execute(
        """SELECT s.UPC, p.product_name, s.product_number, s.selling_price
        FROM Sale s
        JOIN store_product sp ON s.UPC = sp.UPC
        JOIN product p ON sp.id_product = p.id_product
        WHERE s.check_number = %s""",
        (check_number,)
    )
    items = cur.fetchall()
    cur.close()
    conn.close()
    return {"check": check, "items": items}

@router.post("/")
def create_check(data: CheckCreate, user=Depends(require_cashier)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        check_number = f"C{datetime.now().strftime('%d%H%M%S')}"
        sum_total = 0

        for item in data.items:
            cur.execute(
                "SELECT selling_price, products_number FROM store_product WHERE UPC = %s",
                (item.UPC,)
            )
            product = cur.fetchone()
            if not product:
                raise HTTPException(status_code=404, detail=f"Товар {item.UPC} не знайдено")
            if product[1] < item.product_number:
                raise HTTPException(status_code=400, detail=f"Недостатньо товару {item.UPC}")
            sum_total += float(product[0]) * item.product_number

        if data.card_number:
            cur.execute("SELECT percent FROM customer_card WHERE card_number = %s", (data.card_number,))
            card = cur.fetchone()
            if card:
                sum_total = sum_total * (1 - card[0] / 100)

        vat = sum_total * 0.2

        cur.execute(
            'INSERT INTO "Check" VALUES (%s, %s, %s, %s, %s, %s)',
            (check_number, user["id"], data.card_number, datetime.now(), sum_total, vat)
        )

        for item in data.items:
            cur.execute(
                "SELECT selling_price FROM store_product WHERE UPC = %s",
                (item.UPC,)
            )
            price = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO Sale VALUES (%s, %s, %s, %s)",
                (item.UPC, check_number, item.product_number, price)
            )
            cur.execute(
                "UPDATE store_product SET products_number = products_number - %s WHERE UPC = %s",
                (item.product_number, item.UPC)
            )

        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

    return {"message": "Чек створено", "check_number": check_number, "sum_total": sum_total, "vat": vat}

@router.delete("/{check_number}")
def delete_check(check_number: str, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM "Check" WHERE check_number = %s', (check_number,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Чек видалено"}