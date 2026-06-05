from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from dependencies import require_manager

router = APIRouter(prefix="/categories", tags=["categories"])

class CategoryCreate(BaseModel):
    category_name: str

class CategoryUpdate(BaseModel):
    category_name: str

@router.get("/")
def get_all_categories(user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT category_number, category_name FROM Category ORDER BY category_name")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

@router.post("/")
def create_category(data: CategoryCreate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO Category (category_name) VALUES (%s) RETURNING category_number",
            (data.category_name,)
        )
        category_number = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"category_number": category_number, "message": "Категорію додано"}

@router.put("/{category_number}")
def update_category(category_number: int, data: CategoryUpdate, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE Category SET category_name = %s WHERE category_number = %s",
            (data.category_name, category_number)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Категорію не знайдено")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return {"message": "Категорію оновлено"}

@router.delete("/{category_number}")
def delete_category(category_number: int, user=Depends(require_manager)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM Category WHERE category_number = %s", (category_number,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Категорію не знайдено")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=400,
            detail="Неможливо видалити категорію: до неї прив'язані товари"
        )
    finally:
        cur.close()
        conn.close()
    return {"message": "Категорію видалено"}