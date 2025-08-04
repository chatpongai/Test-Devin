import { useState } from 'react'
import { Building2, Users, Calendar, FileText, BarChart3, Bell, Settings, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react'
import DepartmentManagement from './components/DepartmentManagement'
import EmployeeManagement from './components/EmployeeManagement'
import LeaveTypeManagement from './components/LeaveTypeManagement'
import LeaveRequestManagement from './components/LeaveRequestManagement'
import './App.css'

function App() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Overview and statistics' },
    { id: 'departments', name: 'Departments', icon: Building2, description: 'Manage company departments' },
    { id: 'employees', name: 'Employees', icon: Users, description: 'Employee management' },
    { id: 'leave-types', name: 'Leave Types', icon: Calendar, description: 'Configure leave categories' },
    { id: 'leave-requests', name: 'Leave Requests', icon: FileText, description: 'Submit and manage leave requests' },
    { id: 'reports', name: 'Reports', icon: BarChart3, description: 'Leave reports and analytics' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'System notifications' },
    { id: 'settings', name: 'Settings', icon: Settings, description: 'System configuration' }
  ]

  const currentModule = modules.find(m => m.id === activeModule)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-semibold truncate">HR Leave System</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {modules.map((module) => {
              const IconComponent = module.icon
              const isActive = activeModule === module.id
              return (
                <li key={module.id}>
                  <button
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    title={sidebarCollapsed ? module.name : ''}
                  >
                    <IconComponent className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{module.name}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@company.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentModule?.name}</h1>
                <p className="text-gray-600 mt-1">{currentModule?.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {activeModule === 'dashboard' ? (
            <div className="p-6">
              {/* Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900">1</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Departments</p>
                      <p className="text-2xl font-bold text-gray-900">1</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FileText className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Leave Types</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveModule('departments')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Manage Departments</h4>
                    <p className="text-sm text-gray-600">Add, edit, or remove departments</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveModule('employees')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <Users className="h-8 w-8 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Manage Employees</h4>
                    <p className="text-sm text-gray-600">Add, edit, or view employee information</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveModule('leave-types')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Configure Leave Types</h4>
                    <p className="text-sm text-gray-600">Set up different types of leave</p>
                  </button>
                </div>
              </div>

              {/* Development Status */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-900 font-medium mb-2">Development Status</h4>
                <div className="text-blue-800 text-sm">
                  <p>✅ Modern Sidebar Layout Complete - Professional navigation with collapsible sidebar</p>
                  <p>✅ Department Management Complete - Full CRUD operations tested</p>
                  <p>✅ Employee Management Backend Complete - Ready for frontend integration</p>
                  <p>📝 Next: Test Employee Management → Leave Types → Leave Requests → Reports → Notifications → Login</p>
                </div>
              </div>
            </div>
          ) : activeModule === 'departments' ? (
            <DepartmentManagement onBack={() => setActiveModule('dashboard')} />
          ) : activeModule === 'employees' ? (
            <EmployeeManagement onBack={() => setActiveModule('dashboard')} />
          ) : activeModule === 'leave-types' ? (
            <LeaveTypeManagement onBack={() => setActiveModule('dashboard')} />
          ) : activeModule === 'leave-requests' ? (
            <LeaveRequestManagement onBack={() => setActiveModule('dashboard')} />
          ) : (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {currentModule && <currentModule.icon className="h-8 w-8 text-gray-400" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentModule?.name} Module
                </h3>
                <p className="text-gray-600 mb-6">
                  This module is under development. The {currentModule?.name} functionality will be implemented in upcoming iterations.
                </p>
                <button
                  onClick={() => setActiveModule('dashboard')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
