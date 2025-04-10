import { StrictMode } from 'react'; // Kept from the "old" for potential strict mode benefits
import { createRoot } from 'react-dom/client'; // Modern way to create root
import ReactDOM from 'react-dom/client'; // Also modern, can be used interchangeably with createRoot
import App from './App.jsx';
import './index.css'; // Kept from "old" - might contain global resets or older styles
import './styles/variables.css'; // From "new" - likely defines CSS variables
import './styles/global.css'; // From "new" - likely contains the main global styles

// Use the modern createRoot API
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// You could also use the older createRoot if you prefer consistency,
// but ReactDOM.createRoot is the recommended modern approach.
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// );