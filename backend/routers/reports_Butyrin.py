from fastapi import APIRouter, Depends, Query
from database import get_connection
from dependencies import require_manager

router = APIRouter(prefix="/reports/butyrin", tags=["reports-butyrin"])


# Артем Бутирін — запит 1 (групування, ≥3 таблиці, параметричний)
# Умова: для кожної категорії підрахувати кількість рядків продажу, одиниць та виручку;
#         показати лише категорії, де виручка перевищує заданий поріг min_revenue.

@router.get("/category-sales-summary")
def category_sales_summary(
    min_revenue: float = Query(200, description="Мінімальна виручка (грн)"),
    user=Depends(require_manager),
):
    conn = get_connection()
    cur = conn.cursor()

    sql = """
        SELECT
            c.category_name,
            COUNT(*) AS sale_lines,
            SUM(s.product_number) AS total_units,
            SUM(s.product_number * s.selling_price) AS total_revenue
        FROM Category c
        JOIN Product p ON c.category_number = p.category_number
        JOIN Store_Product sp ON p.id_product = sp.id_product
        JOIN Sale s ON sp.UPC = s.UPC
        GROUP BY c.category_name
        HAVING SUM(s.product_number * s.selling_price) > %s
        ORDER BY total_revenue DESC
    """

    cur.execute(sql, (min_revenue,))
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


# Артем Бутирін — запит 2 (подвійне заперечення, ≥3 таблиці)
# Умова: знайти товари, які продав кожен касир (немає касира, який би НЕ продавав цей товар).

@router.get("/products-sold-by-all-cashiers")
def products_sold_by_all_cashiers(user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()

    sql = """
        SELECT p.id_product, p.product_name
        FROM Product p
        WHERE NOT EXISTS (
            SELECT 1
            FROM Employee e
            WHERE e.empl_role = 'Cashier'
              AND NOT EXISTS (
                  SELECT 1
                  FROM "Check" ch
                  JOIN Sale s ON ch.check_number = s.check_number
                  JOIN Store_Product sp ON s.UPC = sp.UPC
                  WHERE ch.id_employee = e.id_employee
                    AND sp.id_product = p.id_product
              )
        )
        ORDER BY p.id_product
    """

    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]
