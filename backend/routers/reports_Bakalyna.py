from fastapi import APIRouter, HTTPException, Depends, Query
from database import get_connection
from dependencies import require_manager

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/store-stats-by-category")
def store_stats_by_category(
    category_number: int = Query(..., description="Номер категорії"),
    user=Depends(require_manager)
):
    conn = get_connection()
    cur = conn.cursor()

    sql = """
        SELECT 
            c.category_name,
            COUNT(sp.UPC)           AS positions_count,
            SUM(sp.products_number) AS total_units
        FROM Category c
        JOIN Product p        ON c.category_number = p.category_number
        JOIN Store_Product sp ON p.id_product = sp.id_product
        WHERE c.category_number = %s
        GROUP BY c.category_name
    """

    cur.execute(sql, (category_number,))

    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


@router.get("/categories-fully-stocked")
def categories_fully_stocked(user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()

    sql = """
        SELECT c.category_number, c.category_name
        FROM Category c
        WHERE NOT EXISTS (
            SELECT p.id_product
            FROM Product p
            WHERE p.category_number = c.category_number
              AND NOT EXISTS (
                  SELECT 1
                  FROM Store_Product sp
                  WHERE sp.id_product = p.id_product
              )
        )
        ORDER BY c.category_name
    """

    cur.execute(sql)

    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]

