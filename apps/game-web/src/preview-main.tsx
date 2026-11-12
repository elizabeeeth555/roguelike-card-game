import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StudioScreen } from './studio/StudioScreen';
import './styles.css';
import './dev-preview.css';
// Development-only host. Storage access is injected, not embedded in shared drawing.
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<StrictMode><StudioScreen storage={() => window.localStorage} /></StrictMode>);
