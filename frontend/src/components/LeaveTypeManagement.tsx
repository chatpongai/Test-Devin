import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Search } from 'lucide-react'

interface LeaveType {
  leave_type_id: number
  leave_type_name: string
  max_per_year: number | null
  created_at: string
}

interface LeaveTypeManagementProps {
  onBack: () => void
}

export default function LeaveTypeManagement({ onBack }: LeaveTypeManagementProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [formData, setFormData] = useState({ leave_type_name: '', max_per_year: '' })
  const [error, setError] = useState('')

  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    fetchLeaveTypes()
  }, [])

  const fetchLeaveTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types/`)
      if (response.ok) {
        const data = await response.json()
        setLeaveTypes(data)
      } else {
        setError('Failed to fetch leave types')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.leave_type_name.trim()) {
      setError('Leave type name is required')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        leave_type_name: formData.leave_type_name,
        max_per_year: formData.max_per_year ? parseInt(formData.max_per_year) : null
      }

      const url = editingLeaveType 
        ? `${API_BASE_URL}/leave-types/${editingLeaveType.leave_type_id}`
        : `${API_BASE_URL}/leave-types/`
      
      const method = editingLeaveType ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        await fetchLeaveTypes()
        setFormData({ leave_type_name: '', max_per_year: '' })
        setShowAddForm(false)
        setEditingLeaveType(null)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to save leave type')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (leaveTypeId: number) => {
    if (!confirm('Are you sure you want to delete this leave type?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types/${leaveTypeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchLeaveTypes()
        setError('')
      } else {
        setError('Failed to delete leave type')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType)
    setFormData({ 
      leave_type_name: leaveType.leave_type_name,
      max_per_year: leaveType.max_per_year?.toString() || ''
    })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingLeaveType(null)
    setFormData({ leave_type_name: '', max_per_year: '' })
    setShowAddForm(false)
    setError('')
  }

  const filteredLeaveTypes = leaveTypes.filter(type =>
    type.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <Calendar className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Type Management</h1>
            <p className="text-gray-600">Configure different types of leave and their policies</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="leave_type_name" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type Name
              </label>
              <input
                type="text"
                id="leave_type_name"
                value={formData.leave_type_name}
                onChange={(e) => setFormData({ ...formData, leave_type_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter leave type name"
                required
              />
            </div>
            <div>
              <label htmlFor="max_per_year" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Days Per Year
              </label>
              <input
                type="number"
                id="max_per_year"
                value={formData.max_per_year}
                onChange={(e) => setFormData({ ...formData, max_per_year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter maximum days (optional)"
                min="0"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingLeaveType ? 'Update' : 'Add')} Leave Type
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leave types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Leave Types ({filteredLeaveTypes.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading leave types...
          </div>
        ) : filteredLeaveTypes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No leave types found matching your search.' : 'No leave types found. Add your first leave type to get started.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeaveTypes.map((leaveType) => (
              <div key={leaveType.leave_type_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{leaveType.leave_type_name}</h4>
                  <p className="text-sm text-gray-500">
                    Max per year: {leaveType.max_per_year ? `${leaveType.max_per_year} days` : 'No limit'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(leaveType.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(leaveType)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit leave type"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(leaveType.leave_type_id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete leave type"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">Leave Type Management Status</h4>
        <div className="text-blue-800 text-sm space-y-1">
          <p>✅ Frontend UI Complete - Leave type list, add, edit, delete functionality</p>
          <p>✅ Backend API Complete - Full CRUD operations with validation</p>
          <p>✅ Database Integration - Leave types with configurable max days per year</p>
          <p>📝 Next: Proceed to Leave Request Management implementation</p>
        </div>
      </div>
    </div>
  )
}
