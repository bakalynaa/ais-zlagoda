# АІС «ZLAGODA»

Автоматизована інформаційна система для керування процесом збуту товарів у продуктовому міні-супермаркеті «ZLAGODA».

## Стек

- **Backend:** Python 3.11, FastAPI, psycopg2
- **Frontend:** React 19, Vite, TypeScript
- **БД:** PostgreSQL 16

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
| [Анастасія Бакалина](https://github.com/bakalynaa) | Backend (FastAPI), Frontend (React), архітектура |
| [Артем Бутирін](https://github.com/artbutyrin) | Frontend (React) |
| [Дар'я Гречко](https://github.com/urkarnad) | Backend (FastAPI) |

---

## Що потрібно встановити

| Інструмент | Навіщо |
|------------|--------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | запуск усього проєкту |
| Git | клонування репозиторію |

Node.js і Python **не потрібні**, якщо працюєте лише через Docker.

---

## Швидкий старт (рекомендовано)

### 1. Клонування

```bash
git clone <url-репозиторію>
cd ais-zlagoda
```

### 2. Запуск усього стеку

Потрібен запущений **Docker Desktop**.

```bash
docker compose up -d --build
```

Піднімається:

| Сервіс | URL |
|--------|-----|
| **Frontend** | http://localhost:5173/first-screen |
| **Backend API** | http://localhost:8000 |
| **PostgreSQL** | `localhost:5433` (БД `zlagoda`, `postgres` / `postgres`) |

При **першому** запуску автоматично виконуються `db/schema.sql` і `db/test_data.sql`.

Перевірка API:

```bash
curl http://localhost:8000/
```

### 3. Вхід у систему

1. Відкрити http://localhost:5173/first-screen
2. Intro → **Enter** або клік/пробіл → `/login`
3. Тестові облікові записи:

| Роль | ID | Пароль |
|------|-----|--------|
| Менеджер | `M001` | `manager123` |
| Касир | `C001` | `cashier123` |

---

## Маршрути frontend

| Шлях | Опис |
|------|------|
| `/first-screen` | 3D intro-анімація |
| `/login` | форма входу |
| `/manager` | кабінет менеджера |
| `/manager/employees`, `/categories`, `/products`, … | розділи менеджера |
| `/cashier` | POS-каса |
| `/cashier/products`, `/customers`, `/checks` | розділи касира |
| `/profile` | профіль працівника |

---

## Docker — корисні команди

```bash
docker compose ps              # статус контейнерів
docker compose logs -f         # логи всіх сервісів
docker compose logs -f frontend
docker compose down            # зупинити
docker compose down -v         # зупинити + видалити БД (перезалити SQL)
docker compose up -d --build   # перезібрати і запустити
```

Підключення до БД з хоста:

```
postgresql://postgres:postgres@localhost:5433/zlagoda
```

---

## Змінні середовища

При `docker compose up` змінні задаються в `docker-compose.yml` — окремі `.env` файли **не обовʼязкові**.

Для локального запуску без Docker скопіюйте приклади:

```bash
cd backend && copy .env.example .env
cd frontend && copy .env.example .env
```

| Сервіс | Файл | Змінні |
|--------|------|--------|
| Backend | `backend/.env.example` | `DATABASE_URL`, `SECRET_KEY` |
| Frontend | `frontend/.env.example` | `VITE_API_URL` (за замовч. `http://localhost:8000`) |

---

## Альтернатива: локальний запуск без Docker

### База даних

Застосувати SQL-файли через psql, pgAdmin або Supabase SQL Editor:

1. `db/schema.sql`
2. `db/test_data.sql`

### Backend

```bash
cd backend
pip install -r requirements.txt
# налаштувати backend/.env (див. .env.example)
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```