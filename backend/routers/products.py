from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from dependencies import require_manager, get_current_user
from typing import Optional

router = APIRouter(prefix="/products", tags=["products"])

class ProductCreate(BaseModel):
    category_number: int
    product_name: str
    manufacturer: str
    characteristics: str

class ProductUpdate(BaseModel):
    category_number: Optional[int] = None
    product_name: Optional[str] = None
    manufacturer: Optional[str] = None
    characteristics: Optional[str] = None

@router.get("/")
def get_all_products(category_number: Optional[int] = None, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    if category_number is not None:
        cur.execute(
            """SELECT p.id_product, p.product_name, p.manufacturer, p.characteristics,
                      c.category_number, c.category_name
               FROM Product p
               JOIN Category c ON p.category_number = c.category_number
               WHERE p.category_number = %s
               ORDER BY p.product_name""",
            (category_number,)
        )
    else:
        cur.execute(
            """SELECT p.id_product, p.product_name, p.manufacturer, p.characteristics,
                      c.category_number, c.category_name
               FROM Product p
               JOIN Category c ON p.category_number = c.category_number
               ORDER BY p.product_name"""
        )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.get("/search")
def search_products(name: str, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT p.id_product, p.product_name, p.manufacturer, p.characteristics,
                  c.category_number, c.category_name
           FROM Product p
           JOIN Category c ON p.category_number = c.category_number
           WHERE p.product_name ILIKE %s
           ORDER BY p.product_name""",
        (f"%{name}%",)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.get("/{id_product}")
def get_product(id_product: int, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT p.id_product, p.product_name, p.manufacturer, p.characteristics,
                  c.category_number, c.category_name
           FROM Product p
           JOIN Category c ON p.category_number = c.category_number
           WHERE p.id_product = %s""",
        (id_product,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Товар не знайдено")
    return row

@router.post("/")
def create_product(data: ProductCreate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO Product (category_number, product_name, manufacturer, characteristics)
               VALUES (%s, %s, %s, %s) RETURNING id_product""",
            (data.category_number, data.product_name, data.manufacturer, data.characteristics)
        )
        id_product = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"id_product": id_product, "message": "Товар додано"}

@router.put("/{id_product}")
def update_product(id_product: int, data: ProductUpdate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """UPDATE Product
               SET category_number = COALESCE(%s, category_number),
                   product_name    = COALESCE(%s, product_name),
                   manufacturer    = COALESCE(%s, manufacturer),
                   characteristics = COALESCE(%s, characteristics)
               WHERE id_product = %s""",
            (data.category_number, data.product_name, data.manufacturer,
             data.characteristics, id_product)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Товар не знайдено")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Товар оновлено"}

@router.delete("/{id_product}")
def delete_product(id_product: int, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM Product WHERE id_product = %s", (id_product,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Товар не знайдено")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=400,
            detail="Неможливо видалити товар: він присутній у магазині"
        )
    finally:
        cur.close()
        conn.close()
    return {"message": "Товар видалено"}