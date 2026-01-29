import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import AppLanding from './AppLanding'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppLanding />
    </StrictMode>,
)
