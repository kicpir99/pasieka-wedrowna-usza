import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ReactLenis } from 'lenis/react';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ReactLenis root options={{ lerp: 0.08, smoothWheel: true, syncTouch: false, touchMultiplier: 1.2 }}>
        <App />
      </ReactLenis>
    </ErrorBoundary>
  </StrictMode>,
);
