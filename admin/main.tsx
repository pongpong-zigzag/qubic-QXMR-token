import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminApp from './App';
import './styles.css';

const rootElement = document.getElementById('admin-root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AdminApp />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'admin-toast',
          style: {
            background: '#1e1b4b',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);

