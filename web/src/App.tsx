import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { AdminLoginPage } from './pages/AdminLogin'
import { AdminDashboardPage } from './pages/AdminDashboard'

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/admin/login" element={<AdminLoginPage />} />
				<Route path="/admin/dashboard" element={<AdminDashboardPage />} />
			</Routes>
		</BrowserRouter>
	)
}
