import { useEffect } from 'react'

// Always use dark mode - no theme switching
export function ThemeProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const root = document.documentElement
		root.classList.add('dark')
		root.style.colorScheme = 'dark'
		root.setAttribute('data-theme', 'dark')
	}, [])

	return <>{children}</>
}


