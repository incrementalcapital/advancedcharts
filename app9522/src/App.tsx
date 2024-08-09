/**
 * @file App.js - The root component of our React application, rendering the TradingView widget.
 */

// Import necessary modules
import React from 'react'; // The core of React for building user interfaces
import TradingViewWidget from './TradingViewWidget'; // Our custom component to embed the TradingView chart
import './App.css'; // Import styles for the App component

/**
 * The main functional component of our application.
 * 
 * @returns {JSX.Element} The rendered JSX structure representing the application's UI.
 */
function App() {
  return (
    // A div container to hold the TradingView widget, styled to occupy the entire viewport
    <div style={{ height: '100vh', width: '100%' }}> 
      {/* 
        Render the TradingViewWidget component with props to configure it:
        - symbol: The financial instrument to display (e.g., NASDAQ:NVDA for NVIDIA stock)
        - interval: The time interval for the chart's data (e.g., D for daily)
        - theme: The visual theme of the chart (e.g., dark)
      */}
      <TradingViewWidget symbol="NASDAQ:NVDA" interval="D" theme="dark" /> 
    </div>
  );
}

// Export the App component as the default export of this module
export default App; 