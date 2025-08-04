from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class DepartmentBase(BaseModel):
    department_name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    pass

class Department(DepartmentBase):
    department_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    department_id: int
    join_date: Optional[date] = None
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    join_date: Optional[date] = None
    is_active: Optional[bool] = None

class Employee(EmployeeBase):
    employee_id: str
    created_at: datetime
    department: Department

    class Config:
        from_attributes = True
