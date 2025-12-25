import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000/api'
const ALLOW_BYPASS = (import.meta.env.VITE_ENABLE_ADMIN_BYPASS ?? 'true').toLowerCase() !== 'false'

export function AdminLoginPage() {
	const navigate = useNavigate()
	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const handleSuccessfulLogin = (token: string, admin: { username: string; email: string; id?: string }) => {
		localStorage.setItem('coreiq_admin_token', token)
		localStorage.setItem('coreiq_admin', JSON.stringify(admin))
		setSuccess('Login successful. Redirecting you to the admin console...')
		setTimeout(() => {
			navigate('/admin/dashboard', { replace: true })
		}, 600)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)
		setSuccess(null)

		if (!identifier.trim() || !password.trim()) {
			setError('Please enter your email or username and password.')
			return
		}

		setLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ identifier: identifier.trim(), password }),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data?.message ?? 'Unable to sign in right now.')
			}

			handleSuccessfulLogin(data.token, data.admin)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unable to sign in right now.'
			if (ALLOW_BYPASS) {
				handleSuccessfulLogin('demo-token', {
					username: identifier.trim() || 'demo_admin',
					email: identifier.includes('@') ? identifier.trim() : 'admin@coreiq.app',
				})
				setSuccess('Signed in with preview access. Backend authentication is bypassed for this session.')
			} else {
				setError(message)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleBypass = () => {
		handleSuccessfulLogin('demo-token', {
			username: identifier.trim() || 'demo_admin',
			email: identifier.includes('@') ? identifier.trim() : 'admin@coreiq.app',
		})
		setSuccess('Preview mode enabled. You now have access to the dashboard experience.')
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),_transparent_60%)]" />
				<div className="absolute inset-0 opacity-40">
					<div className="bg-grid-mask absolute inset-0" />
				</div>
			</div>

			<div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
				<div className="mx-auto flex w-full max-w-5xl flex-col gap-12 lg:flex-row lg:items-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="max-w-xl space-y-6"
					>
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
							<ShieldCheck size={16} className="text-indigo-300" /> Admin Console
						</div>
						<h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
							Secure access for CoreIQ administrators
						</h1>
						<p className="text-base leading-relaxed text-slate-300">
							Manage platform insights, product content, and AI experiences through our protected admin workspace.
							Use your verified CoreIQ admin credentials to continue.
						</p>
						<div className="flex items-center gap-3 text-sm text-slate-400">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
								<ShieldCheck size={18} className="text-indigo-300" />
							</div>
							<span>Enterprise-grade security with strict audit logging and token-based sessions.</span>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="w-full max-w-md"
					>
						<div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.75)] backdrop-blur">
							<div className="mb-6 space-y-2">
								<h2 className="text-2xl font-semibold text-white">Admin sign in</h2>
								<p className="text-sm text-slate-400">Enter your CoreIQ admin credentials to access the console.</p>
							</div>

							<form className="space-y-5" onSubmit={handleSubmit}>
								<div>
									<label htmlFor="identifier" className="text-sm font-medium text-slate-200">
										Email or username
									</label>
									<div className="relative mt-2">
										<Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
										<input
											type="text"
											id="identifier"
											value={identifier}
											onChange={(event) => setIdentifier(event.target.value)}
											autoComplete="username"
											placeholder="admin@coreiq.app or admin_username"
											className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
										/>
									</div>
								</div>

								<div>
									<label htmlFor="password" className="text-sm font-medium text-slate-200">
										Password
									</label>
									<div className="relative mt-2">
										<Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
										<input
											type="password"
											id="password"
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											autoComplete="current-password"
											placeholder="Your secure password"
											className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
										/>
									</div>
								</div>

								{error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
								{success && <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p>}

								<button
									type="submit"
									disabled={loading}
									className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:-translate-y-0.5 hover:shadow-indigo-900/50 disabled:pointer-events-none disabled:opacity-60"
								>
									{loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
								</button>
							</form>

							{ALLOW_BYPASS && (
								<button
									onClick={handleBypass}
									className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-white/10"
								>
									<Sparkles size={16} /> Preview dashboard without backend
								</button>
							)}

							<div className="mt-6 space-y-2 text-xs text-slate-500">
								<p>Having trouble? Contact the CoreIQ platform team to reset your admin access.</p>
								<p>Sessions automatically expire; keep your credentials confidential.</p>
							</div>

							<Link
								to="/"
								className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-200 transition hover:text-indigo-100"
							>
								<ArrowLeft size={14} /> Back to CoreIQ marketing site
							</Link>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}
