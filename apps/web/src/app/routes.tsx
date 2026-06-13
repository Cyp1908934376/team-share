import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/app/layout/MainLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ResourceList } from '@/features/resources/ResourceList'
import { ResourceDetail } from '@/features/resources/ResourceDetail'
import { ResourceForm } from '@/features/resources/ResourceForm'
import { EnvironmentList } from '@/features/environments/EnvironmentList'
import { EnvironmentDetail } from '@/features/environments/EnvironmentDetail'
import { WorkflowList } from '@/features/workflows/WorkflowList'
import { WorkflowEditor } from '@/features/workflows/WorkflowEditor'
import { VersionList } from '@/features/versions/VersionList'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MonitoringDashboard } from '@/features/monitoring/MonitoringDashboard'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TeamList } from '@/features/teams/TeamList'
import { TeamDetail } from '@/features/teams/TeamDetail'
import { useAuthStore } from '@/stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Resources */}
        <Route path="resources" element={<ResourceList />} />
        <Route path="resources/new" element={<ResourceForm />} />
        <Route path="resources/:id" element={<ResourceDetail />} />
        <Route path="resources/:id/edit" element={<ResourceForm />} />

        {/* Environments */}
        <Route path="environments" element={<EnvironmentList />} />
        <Route path="environments/:id" element={<EnvironmentDetail />} />

        {/* Workflows */}
        <Route path="workflows" element={<WorkflowList />} />
        <Route path="workflows/:id" element={<WorkflowEditor />} />

        {/* Versions */}
        <Route path="versions" element={<VersionList />} />

        {/* Teams */}
        <Route path="teams" element={<TeamList />} />
        <Route path="teams/:id" element={<TeamDetail />} />

        {/* Monitoring */}
        <Route path="monitoring" element={<MonitoringDashboard />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
