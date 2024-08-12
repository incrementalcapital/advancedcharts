/**
 * @file App.tsx
 * @description The main application component that serves as the entry point for the React app.
 *              It renders the TradingViewWidget component within a full-screen container.
 */

// Import React library for creating components
import React from 'react';

// Import the TradingViewWidget component from its file
import TradingViewWidget from './TradingViewWidget';

// Import the CSS styles for this component
import './App.css';

/**
 * App component
 * 
 * This is the root component of our application. It doesn't manage any state or side effects,
 * serving primarily as a container for the TradingViewWidget.
 * 
 * @component
 * @returns {JSX.Element} The rendered App component
 */
function App(): JSX.Element {
  return (
    // Outer container div
    // - Sets the height to 100% of the viewport height (100vh)
    // - Sets the width to 100% of the parent container width
    // This ensures that our app takes up the full screen
    <div className="h-screen w-full">
      {/* 
        Render the TradingViewWidget component
        
        We're not passing any props to TradingViewWidget here, which means it will use its default props:
        - initialSymbol: 'AMEX:SPY' (SPDR S&P 500 ETF Trust)
        - interval: 'D' (Daily interval)
        - theme: 'dark' (Dark theme)
        
        If you want to customize these, you can pass props like this:
        <TradingViewWidget initialSymbol="NASDAQ:AAPL" interval="60" theme="light" />
      */}
      <TradingViewWidget />
    </div>
  );
}

// Export the App component as the default export of this module
// This allows other files to import it using:
// import App from './App';
export default App;