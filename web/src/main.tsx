import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider'
import { ExperienceProvider } from './context/ExperienceContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ExperienceProvider>
  </StrictMode>,
)
