from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import List, Optional
from . import models, schemas

def get_departments(db: Session, skip: int = 0, limit: int = 100) -> List[models.Department]:
    return db.query(models.Department).offset(skip).limit(limit).all()

def get_department(db: Session, department_id: int) -> Optional[models.Department]:
    return db.query(models.Department).filter(models.Department.department_id == department_id).first()

def get_department_by_name(db: Session, department_name: str) -> Optional[models.Department]:
    return db.query(models.Department).filter(models.Department.department_name == department_name).first()

def create_department(db: Session, department: schemas.DepartmentCreate) -> models.Department:
    db_department = models.Department(department_name=department.department_name)
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

def update_department(db: Session, department_id: int, department: schemas.DepartmentUpdate) -> Optional[models.Department]:
    db_department = db.query(models.Department).filter(models.Department.department_id == department_id).first()
    if db_department:
        db_department.department_name = department.department_name
        db.commit()
        db.refresh(db_department)
    return db_department

def delete_department(db: Session, department_id: int) -> bool:
    db_department = db.query(models.Department).filter(models.Department.department_id == department_id).first()
    if db_department:
        db.delete(db_department)
        db.commit()
        return True
    return False

def generate_employee_id(db: Session) -> str:
    now = datetime.now()
    year_month = now.strftime("%Y%m")
    
    latest_employee = db.query(models.Employee).filter(
        models.Employee.employee_id.like(f"{year_month}-%")
    ).order_by(models.Employee.employee_id.desc()).first()
    
    if latest_employee:
        running_number = int(latest_employee.employee_id.split("-")[1]) + 1
    else:
        running_number = 1
    
    return f"{year_month}-{running_number:04d}"

def get_employee(db: Session, employee_id: str) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()

def get_employee_by_email(db: Session, email: str) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(models.Employee.email == email).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, department_id: Optional[int] = None, is_active: Optional[bool] = None) -> List[models.Employee]:
    query = db.query(models.Employee)
    
    if search:
        query = query.filter(
            or_(
                models.Employee.employee_id.ilike(f"%{search}%"),
                models.Employee.full_name.ilike(f"%{search}%"),
                models.Employee.email.ilike(f"%{search}%")
            )
        )
    
    if department_id is not None:
        query = query.filter(models.Employee.department_id == department_id)
    
    if is_active is not None:
        query = query.filter(models.Employee.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate) -> models.Employee:
    employee_id = generate_employee_id(db)
    db_employee = models.Employee(
        employee_id=employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department_id=employee.department_id,
        join_date=employee.join_date,
        is_active=employee.is_active
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: str, employee: schemas.EmployeeUpdate) -> Optional[models.Employee]:
    db_employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if db_employee:
        update_data = employee.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_employee, field, value)
        db.commit()
        db.refresh(db_employee)
    return db_employee
