from fastapi import APIRouter, Depends
from database import get_connection
from dependencies import require_manager

router = APIRouter(prefix="/statistics", tags=["statistics"])

@router.get("/cashier-total")
def get_cashier_total(
    cashier_id: str,
    date_from: str,
    date_to: str,
    user=Depends(require_manager)
):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT SUM(sum_total) FROM "Check"
        WHERE id_employee = %s
        AND print_date >= %s AND print_date < %s::date + INTERVAL '1 day'""",
        (cashier_id, date_from, date_to)
    )
    result = cur.fetchone()[0]
    cur.close()
    conn.close()
    return {"cashier_id": cashier_id, "total": result or 0}

@router.get("/all-total")
def get_all_total(
    date_from: str,
    date_to: str,
    user=Depends(require_manager)
):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT SUM(sum_total) FROM "Check"
        WHERE print_date >= %s AND print_date < %s::date + INTERVAL '1 day'""",
        (date_from, date_to)
    )
    result = cur.fetchone()[0]
    cur.close()
    conn.close()
    return {"total": result or 0}

@router.get("/product-count")
def get_product_count(
    upc: str,
    date_from: str,
    date_to: str,
    user=Depends(require_manager)
):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT SUM(s.product_number) FROM Sale s
        JOIN "Check" c ON s.check_number = c.check_number
        WHERE s.UPC = %s
        AND c.print_date >= %s AND c.print_date < %s::date + INTERVAL '1 day'""",
        (upc, date_from, date_to)
    )
    result = cur.fetchone()[0]
    cur.close()
    conn.close()
    return {"upc": upc, "total_sold": result or 0}