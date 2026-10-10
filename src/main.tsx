import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initOAuthPopupHandshake } from './lib/oauthPopupHandler';

// Interceptar ventana emergente de OAuth (Google, etc.) antes de montar la app completa
const isHandledPopup = initOAuthPopupHandshake();

if (!isHandledPopup) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

