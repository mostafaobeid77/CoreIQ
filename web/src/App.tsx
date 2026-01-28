import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { JoinTeamPage } from './pages/JoinTeamPage'
import { AdminLoginPage } from './pages/AdminLogin'
import { AdminDashboardPage } from './pages/AdminDashboard'
import { AdminProfilePage } from './pages/AdminProfile'
import { AdminProvider } from './context/AdminContext'

export default function App() {
	return (
		<BrowserRouter>
			<AdminProvider>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/join-team" element={<JoinTeamPage />} />
					<Route path="/admin/login" element={<AdminLoginPage />} />
					<Route path="/admin/dashboard" element={<AdminDashboardPage />} />
					<Route path="/admin/profile" element={<AdminProfilePage />} />
				</Routes>
			</AdminProvider>
		</BrowserRouter>
	)
}
