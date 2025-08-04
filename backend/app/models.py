from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    role = Column(String(20), nullable=False, default="Employee")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    employees = relationship("Employee", back_populates="user")

class Department(Base):
    __tablename__ = "departments"
    
    department_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    department_name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    employees = relationship("Employee", back_populates="department")

class LeaveType(Base):
    __tablename__ = "leave_types"
    
    leave_type_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    leave_type_name = Column(String(50), nullable=False, unique=True)
    max_per_year = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    leave_requests = relationship("LeaveRequest", back_populates="leave_type")
    leave_balances = relationship("LeaveBalance", back_populates="leave_type")

class Employee(Base):
    __tablename__ = "employees"

    employee_id = Column(String(10), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    join_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    department = relationship("Department", back_populates="employees")
    user = relationship("User", back_populates="employees")
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    leave_balances = relationship("LeaveBalance", back_populates="employee")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    leave_request_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(10), ForeignKey("employees.employee_id"), nullable=False)
    leave_type_id = Column(Integer, ForeignKey("leave_types.leave_type_id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="Pending")
    approved_by = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    employee = relationship("Employee", back_populates="leave_requests")
    leave_type = relationship("LeaveType", back_populates="leave_requests")
    approver = relationship("User", foreign_keys=[approved_by])

class LeaveBalance(Base):
    __tablename__ = "leave_balances"
    
    balance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(10), ForeignKey("employees.employee_id"), nullable=False)
    leave_type_id = Column(Integer, ForeignKey("leave_types.leave_type_id"), nullable=False)
    year = Column(Integer, nullable=False)
    used_days = Column(Integer, nullable=False, default=0)
    remaining_days = Column(Integer, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    employee = relationship("Employee", back_populates="leave_balances")
    leave_type = relationship("LeaveType", back_populates="leave_balances")
