from fastapi import FastAPI
from routers import students

app = FastAPI()

app.include_router(students.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}