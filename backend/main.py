from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, employees, categories, products, store_products, customers, checks, statistics, reports_Hrechko

app = FastAPI(title="AIS Zlagoda")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(store_products.router)
app.include_router(customers.router)
app.include_router(checks.router)
app.include_router(statistics.router)
app.include_router(reports_Hrechko.router)

@app.get("/")
def root():
    return {"message": "AIS Zlagoda API is running"}