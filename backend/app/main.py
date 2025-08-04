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

@app.get("/leave-types/", response_model=List[schemas.LeaveType])
def get_leave_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    leave_types = crud.get_leave_types(db, skip=skip, limit=limit)
    return leave_types

@app.get("/leave-types/{leave_type_id}", response_model=schemas.LeaveType)
def get_leave_type(leave_type_id: int, db: Session = Depends(get_db)):
    db_leave_type = crud.get_leave_type(db, leave_type_id=leave_type_id)
    if db_leave_type is None:
        raise HTTPException(status_code=404, detail="Leave type not found")
    return db_leave_type

@app.post("/leave-types/", response_model=schemas.LeaveType)
def create_leave_type(leave_type: schemas.LeaveTypeCreate, db: Session = Depends(get_db)):
    db_leave_type = crud.get_leave_type_by_name(db, leave_type_name=leave_type.leave_type_name)
    if db_leave_type:
        raise HTTPException(status_code=400, detail="Leave type name already exists")
    return crud.create_leave_type(db=db, leave_type=leave_type)

@app.put("/leave-types/{leave_type_id}", response_model=schemas.LeaveType)
def update_leave_type(leave_type_id: int, leave_type: schemas.LeaveTypeUpdate, db: Session = Depends(get_db)):
    db_leave_type = crud.get_leave_type(db, leave_type_id=leave_type_id)
    if db_leave_type is None:
        raise HTTPException(status_code=404, detail="Leave type not found")
    
    existing_type = crud.get_leave_type_by_name(db, leave_type_name=leave_type.leave_type_name)
    if existing_type and existing_type.leave_type_id != leave_type_id:
        raise HTTPException(status_code=400, detail="Leave type name already exists")
    
    updated_leave_type = crud.update_leave_type(db=db, leave_type_id=leave_type_id, leave_type=leave_type)
    return updated_leave_type

@app.delete("/leave-types/{leave_type_id}")
def delete_leave_type(leave_type_id: int, db: Session = Depends(get_db)):
    db_leave_type = crud.get_leave_type(db, leave_type_id=leave_type_id)
    if db_leave_type is None:
        raise HTTPException(status_code=404, detail="Leave type not found")
    
    success = crud.delete_leave_type(db=db, leave_type_id=leave_type_id)
    if success:
        return {"message": "Leave type deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete leave type")

@app.get("/leave-requests/", response_model=List[schemas.LeaveRequest])
def get_leave_requests(
    skip: int = 0, 
    limit: int = 100, 
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    leave_requests = crud.get_leave_requests(
        db, skip=skip, limit=limit, employee_id=employee_id, status=status
    )
    return leave_requests

@app.get("/leave-requests/{leave_request_id}", response_model=schemas.LeaveRequest)
def get_leave_request(leave_request_id: int, db: Session = Depends(get_db)):
    db_leave_request = crud.get_leave_request(db, leave_request_id=leave_request_id)
    if db_leave_request is None:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return db_leave_request

@app.post("/leave-requests/", response_model=schemas.LeaveRequest)
def create_leave_request(leave_request: schemas.LeaveRequestCreate, db: Session = Depends(get_db)):
    db_employee = crud.get_employee(db, employee_id=leave_request.employee_id)
    if not db_employee:
        raise HTTPException(status_code=400, detail="Employee not found")
    
    db_leave_type = crud.get_leave_type(db, leave_type_id=leave_request.leave_type_id)
    if not db_leave_type:
        raise HTTPException(status_code=400, detail="Leave type not found")
    
    if leave_request.start_date > leave_request.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    return crud.create_leave_request(db=db, leave_request=leave_request)

@app.put("/leave-requests/{leave_request_id}/approve", response_model=schemas.LeaveRequest)
def approve_leave_request(
    leave_request_id: int, 
    approval: schemas.LeaveRequestApproval, 
    db: Session = Depends(get_db)
):
    db_leave_request = crud.get_leave_request(db, leave_request_id=leave_request_id)
    if db_leave_request is None:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    if approval.status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'Approved' or 'Rejected'")
    
    updated_request = crud.update_leave_request_status(db=db, leave_request_id=leave_request_id, approval=approval)
    return updated_request

@app.get("/leave-balances/{employee_id}/{year}", response_model=List[schemas.LeaveBalance])
def get_leave_balances(employee_id: str, year: int, db: Session = Depends(get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    leave_balances = crud.get_leave_balances(db, employee_id=employee_id, year=year)
    return leave_balances

@app.post("/leave-balances/", response_model=schemas.LeaveBalance)
def create_leave_balance(leave_balance: schemas.LeaveBalanceCreate, db: Session = Depends(get_db)):
    return crud.create_leave_balance(db=db, leave_balance=leave_balance)

@app.post("/initialize-data/")
def initialize_default_data(db: Session = Depends(get_db)):
    crud.initialize_leave_types(db)
    return {"message": "Default leave types initialized"}
