import { createRoot } from 'react-dom/client';
import { UseRenderProvider } from 'use-render';
import React from 'react';

import App from './App';

createRoot(document.getElementById('root')).render(
  <UseRenderProvider>
    <App />
  </UseRenderProvider>
);
