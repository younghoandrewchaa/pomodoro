import { createRoot } from 'react-dom/client';
import App from './components/App';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/material-symbols-outlined/400.css';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
