from fastapi import APIRouter, HTTPException, Depends, Query
from database import get_connection
from dependencies import require_manager
from datetime import date

router = APIRouter(prefix="/reports", tags=["reports"])


# Дарʼя Гречко запит 1: продажі по категорії за період

@router.get("/sales-by-category")
def sales_by_category(
    category_number: int = Query(..., description="Номер категорії"),
    date_from: date = Query(..., description="Початок періоду"),
    date_to: date = Query(..., description="Кінець періоду"),
    user=Depends(require_manager)
):
    conn = get_connection()
    cur = conn.cursor()

    sql = """
        SELECT 
            p.product_name,
            c.category_name,
            SUM(s.product_number) AS total_sold
        FROM Sale s
        JOIN Store_Product sp ON s.UPC = sp.UPC
        JOIN Product p ON sp.id_product = p.id_product
        JOIN Category c ON p.category_number = c.category_number
        WHERE c.category_number = %s
          AND s.check_number IN (
              SELECT check_number FROM "Check"
              WHERE print_date >= %s AND print_date <= %s
          )
        GROUP BY p.product_name, c.category_name
        ORDER BY total_sold DESC
    """

    cur.execute(sql, (category_number, date_from, date_to))

    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return []

    return [dict(zip(columns, row)) for row in rows]


# Дарʼя Гречко запит 2: касири що продавали всі товари категорії

@router.get("/cashiers-sold-all-in-category")
def cashiers_sold_all_in_category(
    category_number: int = Query(..., description="Номер категорії"),
    user=Depends(require_manager)
):
    conn = get_connection()
    cur = conn.cursor()

    sql = """
        SELECT DISTINCT e.id_employee, e.empl_surname, e.empl_name
        FROM Employee e
        WHERE e.empl_role = 'Cashier'
          AND NOT EXISTS (
              SELECT p.id_product
              FROM Product p
              WHERE p.category_number = %s
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Check" ch
                    JOIN Sale s ON ch.check_number = s.check_number
                    JOIN Store_Product sp ON s.UPC = sp.UPC
                    WHERE ch.id_employee = e.id_employee
                      AND sp.id_product = p.id_product
                )
          )
        ORDER BY e.empl_surname
    """

    cur.execute(sql, (category_number,))
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


