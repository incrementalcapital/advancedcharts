/**
 * @file App.tsx
 * @description The main application component that renders the TradingViewWidget.
 */

import React, { useState, useEffect } from 'react'; // Import necessary hooks from React
import TradingViewWidget from './TradingViewWidget'; // Import our custom TradingViewWidget component
import './App.css'; // Import CSS styles for this component

/**
 * The main App component.
 * @function
 * @returns {JSX.Element} The rendered App component
 */
function App(): JSX.Element {
  // State to hold the initial symbol entered by the user
  const [initialSymbol, setInitialSymbol] = useState<string | null>(null);

  /**
   * Prompts the user to enter a ticker symbol.
   * @function
   */
  const promptForSymbol = (): void => {
    // Use the browser's built-in prompt to get user input
    const input = prompt("Enter a ticker symbol (e.g., NASDAQ:AAPL):");
    // If the user entered a symbol (didn't cancel), update the state
    if (input) {
      setInitialSymbol(input);
    }
  };

  /**
   * Effect hook to prompt for a symbol when the component mounts.
   * @effect
   */
  useEffect(() => {
    // If there's no initial symbol, prompt the user to enter one
    if (!initialSymbol) {
      promptForSymbol();
    }
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    // Main container div, set to full viewport height and width
    <div style={{ height: '100vh', width: '100%' }}>
      {initialSymbol ? (
        // If we have an initial symbol, render the TradingViewWidget
        <TradingViewWidget 
          initialSymbol={initialSymbol} // Pass the initial symbol to the widget
          interval="D" // Set the default interval to daily
          theme="dark" // Set the default theme to dark
        />
      ) : (
        // If we don't have an initial symbol, show a button to enter one
        <div className="flex items-center justify-center h-full">
          <button 
            onClick={promptForSymbol} // Call promptForSymbol when clicked
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Enter Ticker Symbol
          </button>
        </div>
      )}
    </div>
  );
}

export default App; // Export the App component as the default export