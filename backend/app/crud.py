from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, date
from typing import List, Optional
import uuid
import hashlib
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

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    user_id = str(uuid.uuid4())
    password_hash = hashlib.sha256(user.password.encode()).hexdigest()
    db_user = models.User(
        user_id=user_id,
        username=user.username,
        password_hash=password_hash,
        email=user.email,
        role=user.role,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_leave_types(db: Session, skip: int = 0, limit: int = 100) -> List[models.LeaveType]:
    return db.query(models.LeaveType).offset(skip).limit(limit).all()

def get_leave_type(db: Session, leave_type_id: int) -> Optional[models.LeaveType]:
    return db.query(models.LeaveType).filter(models.LeaveType.leave_type_id == leave_type_id).first()

def get_leave_type_by_name(db: Session, leave_type_name: str) -> Optional[models.LeaveType]:
    return db.query(models.LeaveType).filter(models.LeaveType.leave_type_name == leave_type_name).first()

def create_leave_type(db: Session, leave_type: schemas.LeaveTypeCreate) -> models.LeaveType:
    db_leave_type = models.LeaveType(
        leave_type_name=leave_type.leave_type_name,
        max_per_year=leave_type.max_per_year
    )
    db.add(db_leave_type)
    db.commit()
    db.refresh(db_leave_type)
    return db_leave_type

def update_leave_type(db: Session, leave_type_id: int, leave_type: schemas.LeaveTypeUpdate) -> Optional[models.LeaveType]:
    db_leave_type = db.query(models.LeaveType).filter(models.LeaveType.leave_type_id == leave_type_id).first()
    if db_leave_type:
        db_leave_type.leave_type_name = leave_type.leave_type_name
        db_leave_type.max_per_year = leave_type.max_per_year
        db.commit()
        db.refresh(db_leave_type)
    return db_leave_type

def delete_leave_type(db: Session, leave_type_id: int) -> bool:
    db_leave_type = db.query(models.LeaveType).filter(models.LeaveType.leave_type_id == leave_type_id).first()
    if db_leave_type:
        db.delete(db_leave_type)
        db.commit()
        return True
    return False

def get_leave_requests(db: Session, skip: int = 0, limit: int = 100, employee_id: Optional[str] = None, status: Optional[str] = None) -> List[models.LeaveRequest]:
    query = db.query(models.LeaveRequest)
    
    if employee_id:
        query = query.filter(models.LeaveRequest.employee_id == employee_id)
    
    if status:
        query = query.filter(models.LeaveRequest.status == status)
    
    return query.order_by(models.LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()

def get_leave_request(db: Session, leave_request_id: int) -> Optional[models.LeaveRequest]:
    return db.query(models.LeaveRequest).filter(models.LeaveRequest.leave_request_id == leave_request_id).first()

def create_leave_request(db: Session, leave_request: schemas.LeaveRequestCreate) -> models.LeaveRequest:
    db_leave_request = models.LeaveRequest(
        employee_id=leave_request.employee_id,
        leave_type_id=leave_request.leave_type_id,
        start_date=leave_request.start_date,
        end_date=leave_request.end_date,
        reason=leave_request.reason,
        status="Pending"
    )
    db.add(db_leave_request)
    db.commit()
    db.refresh(db_leave_request)
    return db_leave_request

def update_leave_request_status(db: Session, leave_request_id: int, approval: schemas.LeaveRequestApproval) -> Optional[models.LeaveRequest]:
    db_leave_request = db.query(models.LeaveRequest).filter(models.LeaveRequest.leave_request_id == leave_request_id).first()
    if db_leave_request:
        db_leave_request.status = approval.status
        db_leave_request.approved_by = approval.approved_by
        db.commit()
        db.refresh(db_leave_request)
    return db_leave_request

def get_leave_balances(db: Session, employee_id: str, year: int) -> List[models.LeaveBalance]:
    return db.query(models.LeaveBalance).filter(
        models.LeaveBalance.employee_id == employee_id,
        models.LeaveBalance.year == year
    ).all()

def create_leave_balance(db: Session, leave_balance: schemas.LeaveBalanceCreate) -> models.LeaveBalance:
    db_leave_balance = models.LeaveBalance(
        employee_id=leave_balance.employee_id,
        leave_type_id=leave_balance.leave_type_id,
        year=leave_balance.year,
        used_days=leave_balance.used_days,
        remaining_days=leave_balance.remaining_days
    )
    db.add(db_leave_balance)
    db.commit()
    db.refresh(db_leave_balance)
    return db_leave_balance

def update_leave_balance(db: Session, balance_id: int, leave_balance: schemas.LeaveBalanceUpdate) -> Optional[models.LeaveBalance]:
    db_leave_balance = db.query(models.LeaveBalance).filter(models.LeaveBalance.balance_id == balance_id).first()
    if db_leave_balance:
        if leave_balance.used_days is not None:
            db_leave_balance.used_days = leave_balance.used_days
        if leave_balance.remaining_days is not None:
            db_leave_balance.remaining_days = leave_balance.remaining_days
        db.commit()
        db.refresh(db_leave_balance)
    return db_leave_balance

def initialize_leave_types(db: Session):
    default_types = [
        {"leave_type_name": "Annual Leave", "max_per_year": 20},
        {"leave_type_name": "Sick Leave", "max_per_year": 10},
        {"leave_type_name": "Personal Leave", "max_per_year": 5},
        {"leave_type_name": "Maternity Leave", "max_per_year": 90},
        {"leave_type_name": "Emergency Leave", "max_per_year": 3}
    ]
    
    for leave_type_data in default_types:
        existing = db.query(models.LeaveType).filter(
            models.LeaveType.leave_type_name == leave_type_data["leave_type_name"]
        ).first()
        if not existing:
            create_leave_type(db, schemas.LeaveTypeCreate(**leave_type_data))
