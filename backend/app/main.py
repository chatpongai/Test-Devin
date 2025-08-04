from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HR Leave Management API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "HR Leave Management API", "version": "1.0.0"}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/departments/", response_model=List[schemas.Department])
def get_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    departments = crud.get_departments(db, skip=skip, limit=limit)
    return departments

@app.get("/departments/{department_id}", response_model=schemas.Department)
def get_department(department_id: int, db: Session = Depends(get_db)):
    db_department = crud.get_department(db, department_id=department_id)
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return db_department

@app.post("/departments/", response_model=schemas.Department)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_department = crud.get_department_by_name(db, department_name=department.department_name)
    if db_department:
        raise HTTPException(status_code=400, detail="Department name already exists")
    return crud.create_department(db=db, department=department)

@app.put("/departments/{department_id}", response_model=schemas.Department)
def update_department(department_id: int, department: schemas.DepartmentUpdate, db: Session = Depends(get_db)):
    db_department = crud.get_department(db, department_id=department_id)
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    existing_dept = crud.get_department_by_name(db, department_name=department.department_name)
    if existing_dept and existing_dept.department_id != department_id:
        raise HTTPException(status_code=400, detail="Department name already exists")
    
    updated_department = crud.update_department(db=db, department_id=department_id, department=department)
    return updated_department

@app.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    db_department = crud.get_department(db, department_id=department_id)
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    success = crud.delete_department(db=db, department_id=department_id)
    if success:
        return {"message": "Department deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete department")

@app.get("/employees/", response_model=List[schemas.Employee])
def get_employees(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    employees = crud.get_employees(
        db, skip=skip, limit=limit, search=search, 
        department_id=department_id, is_active=is_active
    )
    return employees

@app.get("/employees/{employee_id}", response_model=schemas.Employee)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db_employee

@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_department = crud.get_department(db, department_id=employee.department_id)
    if not db_department:
        raise HTTPException(status_code=400, detail="Department not found")
    
    db_employee = crud.get_employee_by_email(db, email=employee.email)
    if db_employee:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    return crud.create_employee(db=db, employee=employee)

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: str, employee: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if employee.department_id is not None:
        db_department = crud.get_department(db, department_id=employee.department_id)
        if not db_department:
            raise HTTPException(status_code=400, detail="Department not found")
    
    if employee.email is not None:
        existing_employee = crud.get_employee_by_email(db, email=employee.email)
        if existing_employee and existing_employee.employee_id != employee_id:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    updated_employee = crud.update_employee(db=db, employee_id=employee_id, employee=employee)
    return updated_employee
