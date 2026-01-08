
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
// Removed StrictMode as it causes ResizeObserver/ResponsiveContainer issues in Recharts + React 19
root.render(<App />);
