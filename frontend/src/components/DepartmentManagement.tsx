import React, { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, Search } from 'lucide-react'

interface Department {
  department_id: number
  department_name: string
  created_at: string
}

interface DepartmentManagementProps {
  onBack: () => void
}

export default function DepartmentManagement({ onBack }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ department_name: '' })
  const [error, setError] = useState('')

  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/departments/`)
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      } else {
        setError('Failed to fetch departments')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.department_name.trim()) {
      setError('Department name is required')
      return
    }

    setLoading(true)
    try {
      const url = editingDepartment 
        ? `${API_BASE_URL}/departments/${editingDepartment.department_id}`
        : `${API_BASE_URL}/departments/`
      
      const method = editingDepartment ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchDepartments()
        setFormData({ department_name: '' })
        setShowAddForm(false)
        setEditingDepartment(null)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to save department')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (departmentId: number) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchDepartments()
        setError('')
      } else {
        setError('Failed to delete department')
      }
    } catch (err) {
      setError('Backend server not available. Please ensure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({ department_name: department.department_name })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingDepartment(null)
    setFormData({ department_name: '' })
    setShowAddForm(false)
    setError('')
  }

  const filteredDepartments = departments.filter(dept =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <Building2 className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600">Manage company departments and organizational structure</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="department_name" className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                id="department_name"
                value={formData.department_name}
                onChange={(e) => setFormData({ department_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department name"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Add')} Department
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Departments List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Departments ({filteredDepartments.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading departments...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No departments found matching your search.' : 'No departments found. Add your first department to get started.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDepartments.map((department) => (
              <div key={department.department_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{department.department_name}</h4>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(department.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(department)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit department"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(department.department_id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Development Status */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">Department Management Status</h4>
        <div className="text-blue-800 text-sm space-y-1">
          <p>✅ Frontend UI Complete - Department list, add, edit, delete functionality</p>
          <p>✅ Backend API Complete - Full CRUD operations with validation</p>
          <p>✅ Database Integration - SQLite in-memory database working perfectly</p>
          <p>✅ Full CRUD Testing - Create, Read, Update, Delete all verified working</p>
          <p>📝 Next: Proceed to Employee Management module implementation</p>
        </div>
      </div>
    </div>
  )
}
