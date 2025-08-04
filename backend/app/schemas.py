from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "Employee"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

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

class LeaveTypeBase(BaseModel):
    leave_type_name: str
    max_per_year: Optional[int] = None

class LeaveTypeCreate(LeaveTypeBase):
    pass

class LeaveTypeUpdate(LeaveTypeBase):
    pass

class LeaveType(LeaveTypeBase):
    leave_type_id: int
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

class LeaveRequestBase(BaseModel):
    employee_id: str
    leave_type_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    leave_type_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None
    status: Optional[str] = None

class LeaveRequestApproval(BaseModel):
    status: str
    approved_by: str

class LeaveRequest(LeaveRequestBase):
    leave_request_id: int
    status: str
    approved_by: Optional[str] = None
    created_at: datetime
    employee: Employee
    leave_type: LeaveType

    class Config:
        from_attributes = True

class LeaveBalanceBase(BaseModel):
    employee_id: str
    leave_type_id: int
    year: int
    used_days: int = 0
    remaining_days: int

class LeaveBalanceCreate(LeaveBalanceBase):
    pass

class LeaveBalanceUpdate(BaseModel):
    used_days: Optional[int] = None
    remaining_days: Optional[int] = None

class LeaveBalance(LeaveBalanceBase):
    balance_id: int
    updated_at: datetime
    employee: Employee
    leave_type: LeaveType

    class Config:
        from_attributes = True
