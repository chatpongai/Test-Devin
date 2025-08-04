import React, { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Search, Calendar, User, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react'

interface Department {
  department_id: number
  department_name: string
  created_at: string
}

interface Employee {
  employee_id: string
  full_name: string
  email: string
  department_id: number
  join_date: string | null
  is_active: boolean
  created_at: string
  department: Department
}

interface LeaveType {
  leave_type_id: number
  leave_type_name: string
  max_per_year: number | null
  created_at: string
}

interface LeaveRequest {
  leave_request_id: number
  employee_id: string
  leave_type_id: number
  start_date: string
  end_date: string
  reason: string | null
  status: string
  approved_by: string | null
  created_at: string
  employee: Employee
  leave_type: LeaveType
}

interface LeaveRequestManagementProps {
  onBack: () => void
}

export default function LeaveRequestManagement({ onBack }: LeaveRequestManagementProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [employeeFilter, setEmployeeFilter] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null)
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [error, setError] = useState('')

  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    fetchLeaveRequests()
    fetchEmployees()
    fetchLeaveTypes()
  }, [])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      let url = `${API_BASE_URL}/leave-requests/?`
      const params = new URLSearchParams()
      
      if (employeeFilter) params.append('employee_id', employeeFilter)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await fetch(`${url}${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data)
      } else {
        setError('Failed to fetch leave requests')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types/`)
      if (response.ok) {
        const data = await response.json()
        setLeaveTypes(data)
      }
    } catch (err) {
      console.error('Failed to fetch leave types:', err)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeaveRequests()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [employeeFilter, statusFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.employee_id || !formData.leave_type_id || !formData.start_date || !formData.end_date) {
      setError('Employee, leave type, start date, and end date are required')
      return
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Start date must be before end date')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        employee_id: formData.employee_id,
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null
      }

      const response = await fetch(`${API_BASE_URL}/leave-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        await fetchLeaveRequests()
        setFormData({
          employee_id: '',
          leave_type_id: '',
          start_date: '',
          end_date: '',
          reason: ''
        })
        setShowModal(false)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to create leave request')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (requestId: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      return
    }

    setLoading(true)
    try {
      const approvalData = {
        status: status,
        approved_by: 'admin-user-id'
      }

      const response = await fetch(`${API_BASE_URL}/leave-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData),
      })

      if (response.ok) {
        await fetchLeaveRequests()
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to update leave request')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const startAdd = () => {
    setEditingRequest(null)
    setFormData({
      employee_id: '',
      leave_type_id: '',
      start_date: '',
      end_date: '',
      reason: ''
    })
    setShowModal(true)
  }

  const cancelEdit = () => {
    setEditingRequest(null)
    setFormData({
      employee_id: '',
      leave_type_id: '',
      start_date: '',
      end_date: '',
      reason: ''
    })
    setShowModal(false)
    setError('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const filteredRequests = leaveRequests.filter(request =>
    request.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.leave_type.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Request Management</h1>
            <p className="text-gray-600">Submit and manage leave requests</p>
          </div>
        </div>
        <button
          onClick={startAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Leave Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('')
              setEmployeeFilter('')
              setStatusFilter('')
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Leave Requests ({filteredRequests.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading leave requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || employeeFilter || statusFilter 
              ? 'No leave requests found matching your criteria.' 
              : 'No leave requests found. Submit your first leave request to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.leave_request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.employee.full_name}</div>
                          <div className="text-sm text-gray-500">{request.employee.employee_id}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {request.employee.department.department_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.leave_type.leave_type_name}</div>
                      {request.reason && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">{request.reason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted: {formatDate(request.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(request.leave_request_id, 'Approved')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(request.leave_request_id, 'Rejected')}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Submit Leave Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="leave_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type *
                </label>
                <select
                  id="leave_type_id"
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.leave_type_id} value={type.leave_type_id}>
                      {type.leave_type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Optional reason for leave"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">Leave Request Management Status</h4>
        <div className="text-blue-800 text-sm space-y-1">
          <p>✅ Frontend UI Complete - Leave request submission, approval, and history</p>
          <p>✅ Backend API Complete - Full CRUD operations with validation</p>
          <p>✅ Request Workflow - Submit, approve/reject, filter and search functionality</p>
          <p>✅ Integration Complete - Connected with employees and leave types</p>
          <p>📝 Next: Test complete functionality and create PR</p>
        </div>
      </div>
    </div>
  )
}
