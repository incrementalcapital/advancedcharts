/**
 * @file index.tsx - The entry point of our TypeScript React application, responsible for rendering the root component into the DOM.
 */

// Import necessary modules
import React from 'react'; // The core of React for building user interfaces
import ReactDOM from 'react-dom/client'; // The bridge between React and the browser's DOM
import './index.css'; // Import global styles for the entire application
import App from './App'; // The root component of our application
import reportWebVitals from './reportWebVitals'; // A function to measure and report web vitals for performance optimization

/**
 * Create a root using ReactDOM. The `getElementById` method might return null, 
 * so we use a non-null assertion operator (!) to tell TypeScript we're sure it will find the element.
 * 
 * @type {ReactDOM.Root} 
 */
const root = ReactDOM.createRoot(
  document.getElementById('root')! // Find the HTML element with the id 'root' where our app will be mounted
);

/**
 * Render the App component within a React.StrictMode wrapper to help identify potential problems in development.
 */
root.render(
  <React.StrictMode> 
    <App /> 
  </React.StrictMode>
);

// Conditional call to reportWebVitals, allowing performance monitoring if desired
// The provided URL offers further information on web vitals and their significance
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(); 
}