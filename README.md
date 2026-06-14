# АІС «ZLAGODA»

Автоматизована інформаційна система для керування процесом збуту товарів у продуктовому міні-супермаркеті «ZLAGODA».

## Стек

- **Backend:** Python, FastAPI, psycopg2
- **Frontend:** React (Vite, TypeScript)
- **БД:** PostgreSQL (Supabase)

> SQL-запити виконуються без ORM — лише чистий SQL.

## Функціональність

Система підтримує дві ролі користувачів:

- **Менеджер** — управління працівниками, категоріями, товарами, товарами в магазині, клієнтами; перегляд чеків, статистики продажів та друк звітів
- **Касир** — здійснення продажу (POS-каса з кошиком), управління картками клієнтів, перегляд власних чеків

## Безпека

- Аутентифікація через JWT-токени
- Паролі зберігаються у хешованому вигляді (bcrypt)
- Розмежування доступу за роллю (Manager / Cashier)

## Команда

| Учасник | Роль |
|---------|------|
| [Анастасія Бакалина](https://github.com/bakalynaa) | Backend (fastAPI), Frontend (React), архітектура |
| [Артем Бутирін](https://github.com/artbutyrin) | Frontend (React) |
| [Дар'я Гречко](https://github.com/urkarnad) | Backend (FastAPI) |

## Запуск

### Backend
```
bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
### Frontend
```
bash
cd frontend
npm install
npm run dev
```
### Змінні середовища
Створи файл backend/.env:
```
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret_key
```
