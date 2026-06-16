from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from dependencies import require_manager, get_current_user
from typing import Optional

router = APIRouter(prefix="/store-products", tags=["store-products"])

class StoreProductCreate(BaseModel):
    UPC: str
    id_product: int
    selling_price: float
    products_number: int
    promotional_product: bool
    UPC_prom: Optional[str] = None

class StoreProductUpdate(BaseModel):
    selling_price: Optional[float] = None
    products_number: Optional[int] = None


LIST_COLS = ["UPC", "UPC_prom", "selling_price", "products_number",
             "promotional_product", "product_name", "manufacturer", "characteristics"]

DETAIL_COLS = ["UPC", "selling_price", "products_number", "promotional_product",
               "product_name", "manufacturer", "characteristics"]

def _list_row(row):
    return dict(zip(LIST_COLS, row))

def _detail_row(row):
    return dict(zip(DETAIL_COLS, row))


def _get_store_product(cur, upc: str):
    cur.execute(
        "SELECT UPC, UPC_prom, id_product, selling_price, products_number, promotional_product "
        "FROM Store_Product WHERE UPC = %s",
        (upc,)
    )
    return cur.fetchone()


@router.get("/")
def get_all_store_products(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT sp.UPC, sp.UPC_prom, sp.selling_price, sp.products_number,
                  sp.promotional_product, p.product_name, p.manufacturer, p.characteristics
           FROM Store_Product sp
           JOIN Product p ON sp.id_product = p.id_product
           ORDER BY sp.products_number"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_list_row(r) for r in rows]


@router.get("/by-name")
def get_store_products_by_name(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT sp.UPC, sp.UPC_prom, sp.selling_price, sp.products_number,
                  sp.promotional_product, p.product_name, p.manufacturer, p.characteristics
           FROM Store_Product sp
           JOIN Product p ON sp.id_product = p.id_product
           ORDER BY p.product_name"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_list_row(r) for r in rows]


@router.get("/promotional")
def get_promotional(sort: str = "count", user=Depends(get_current_user)):
    order = "sp.products_number" if sort == "count" else "p.product_name"
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT sp.UPC, sp.UPC_prom, sp.selling_price, sp.products_number,
                   sp.promotional_product, p.product_name, p.manufacturer, p.characteristics
            FROM Store_Product sp
            JOIN Product p ON sp.id_product = p.id_product
            WHERE sp.promotional_product = true
            ORDER BY {order}"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_list_row(r) for r in rows]


@router.get("/non-promotional")
def get_non_promotional(sort: str = "count", user=Depends(get_current_user)):
    order = "sp.products_number" if sort == "count" else "p.product_name"
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT sp.UPC, sp.UPC_prom, sp.selling_price, sp.products_number,
                   sp.promotional_product, p.product_name, p.manufacturer, p.characteristics
            FROM Store_Product sp
            JOIN Product p ON sp.id_product = p.id_product
            WHERE sp.promotional_product = false
            ORDER BY {order}"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_list_row(r) for r in rows]


@router.get("/{upc}")
def get_store_product(upc: str, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT sp.UPC, sp.selling_price, sp.products_number, sp.promotional_product,
                  p.product_name, p.manufacturer, p.characteristics
           FROM Store_Product sp
           JOIN Product p ON sp.id_product = p.id_product
           WHERE sp.UPC = %s""",
        (upc,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Товар у магазині не знайдено")
    return _detail_row(row)


@router.post("/")
def create_store_product(data: StoreProductCreate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        if data.promotional_product:
            if not data.UPC_prom:
                raise HTTPException(
                    status_code=400,
                    detail="Для акційного товару потрібно вказати UPC_prom"
                )

            base = _get_store_product(cur, data.UPC_prom)
            if not base:
                raise HTTPException(status_code=404, detail="Звичайний товар з таким UPC_prom не знайдено")
            if base[5]:
                raise HTTPException(
                    status_code=400,
                    detail="UPC_prom повинен вказувати на НЕакційний товар"
                )

            cur.execute(
                "SELECT UPC FROM Store_Product WHERE UPC_prom = %s",
                (data.UPC_prom,)
            )
            if cur.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="Для цього товару вже існує акційний варіант"
                )

            promo_price = round(float(base[3]) * 0.8, 4)

            cur.execute(
                """INSERT INTO Store_Product
                   (UPC, UPC_prom, id_product, selling_price, products_number, promotional_product)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (data.UPC, data.UPC_prom, data.id_product,
                 promo_price, data.products_number, True)
            )
        else:
            cur.execute(
                """INSERT INTO Store_Product
                   (UPC, UPC_prom, id_product, selling_price, products_number, promotional_product)
                   VALUES (%s, NULL, %s, %s, %s, %s)""",
                (data.UPC, data.id_product,
                 data.selling_price, data.products_number, False)
            )

        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Товар у магазині додано"}


@router.put("/{upc}")
def update_store_product(upc: str, data: StoreProductUpdate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        existing = _get_store_product(cur, upc)
        if not existing:
            raise HTTPException(status_code=404, detail="Товар у магазині не знайдено")

        upc_val, upc_prom, id_product, current_price, current_number, is_promo = existing

        if is_promo and data.selling_price is not None:
            raise HTTPException(
                status_code=400,
                detail="Ціна акційного товару задається автоматично через ціну звичайного товару"
            )

        new_price = data.selling_price if data.selling_price is not None else current_price
        new_number = data.products_number if data.products_number is not None else current_number

        cur.execute(
            """UPDATE Store_Product
               SET selling_price = %s, products_number = %s
               WHERE UPC = %s""",
            (new_price, new_number, upc)
        )

        if not is_promo and data.selling_price is not None:
            cur.execute(
                "SELECT UPC FROM Store_Product WHERE UPC_prom = %s",
                (upc,)
            )
            promo_row = cur.fetchone()
            if promo_row:
                promo_price = round(float(new_price) * 0.8, 4)
                cur.execute(
                    "UPDATE Store_Product SET selling_price = %s WHERE UPC = %s",
                    (promo_price, promo_row[0])
                )

        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Товар у магазині оновлено"}


@router.delete("/{upc}")
def delete_store_product(upc: str, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT UPC FROM Store_Product WHERE UPC_prom = %s",
            (upc,)
        )
        promo_row = cur.fetchone()
        if promo_row:
            cur.execute("DELETE FROM Store_Product WHERE UPC = %s", (promo_row[0],))

        cur.execute("DELETE FROM Store_Product WHERE UPC = %s", (upc,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Товар у магазині не знайдено")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=400,
            detail="Неможливо видалити товар: він присутній у чеках"
        )
    finally:
        cur.close()
        conn.close()
    return {"message": "Товар у магазині видалено"}
