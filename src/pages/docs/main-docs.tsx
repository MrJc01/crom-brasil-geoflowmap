import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import AppDocs from './AppDocs'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppDocs />
    </StrictMode>,
)
