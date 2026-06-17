import { createRoot } from 'react-dom/client';
import App from './components/App';
import '@fontsource/hanken-grotesk/300.css';
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/hanken-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/material-symbols-outlined/400.css';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
