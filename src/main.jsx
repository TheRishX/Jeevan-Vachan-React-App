import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
import './themes.css';
import './reader-enhancements.css';
import './media-enhancements.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
