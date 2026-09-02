import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './index.css';
import { theme } from './theme.js';
import App from './App.jsx';

// The app booted, so whatever HTML got us here was current. Clear the guard in
// index.html so it can fire again after the next deploy.
try { sessionStorage.removeItem('until.staleReload'); } catch (e) { /* private mode */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
