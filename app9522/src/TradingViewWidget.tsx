/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget with improved UI and functionality.
 * This component allows users to view various technical indicators and compare multiple symbols on a single chart.
 */

// Import necessary React hooks and types
import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Enum for different chart types
 * Each value represents a different chart configuration with specific indicators
 * @enum {string}
 */
enum ChartType {
  ShortInterest = 'Short Interest', // Shows short volume data alongside the main chart
  MACD = 'MACD', // Moving Average Convergence Divergence
  RSI = 'RSI', // Relative Strength Index
  OBV = 'OBV', // On-Balance Volume
  AD = 'AD', // Accumulation/Distribution
  ATR = 'ATR', // Average True Range
  SlowStoch = 'Slow Stochastic' // Slow Stochastic Oscillator
}

/**
 * Props for the TradingViewWidget component
 * @interface TradingViewWidgetProps
 * @property {string} [symbol='NASDAQ:NVDA'] - The default symbol to display on the chart (e.g., 'NASDAQ:AAPL' for Apple Inc.)
 * @property {string} [interval='D'] - The default time interval for the chart (e.g., 'D' for daily, 'W' for weekly, '60' for 60 minutes)
 * @property {('light'|'dark')} [theme='dark'] - The color theme of the widget
 */
interface TradingViewWidgetProps {
  initialSymbol?: string; // The initial symbol to display on the chart
  interval?: string; // The default time interval for the chart
  theme?: 'light' | 'dark'; // The color theme of the widget
}

/**
 * Interface for compare symbol configuration
 * Used to add additional symbols to the chart for comparison
 * @interface CompareSymbol
 */
interface CompareSymbol {
  symbol: string; // The symbol to compare
  title?: string; // Optional title for the compare symbol
  position: string; // Position on the chart (e.g., 'NewPriceScale' for a new price scale)
}

/**
 * Predefined watchlist of ticker symbols
 */
const WATCHLIST = ["INDEX:SPX", "NASDAQ:AMAT", "NASDAQ:ARM", "NASDAQ:QCOM", "NASDAQ:NVDA", "NYSE:TSM"];

/**
 * TradingViewWidget component
 * Renders a TradingView chart with configurable options and chart types
 *
 * @component
 * @example
 * // Basic usage
 * <TradingViewWidget />
 * 
 * // Custom symbol and interval
 * <TradingViewWidget symbol="NASDAQ:AAPL" interval="60" />
 *
 * @param {TradingViewWidgetProps} props - The props for the TradingViewWidget component
 * @returns {JSX.Element} The rendered TradingView widget with menu
 */
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  initialSymbol = 'AMEX:SPY', // Default to SPDR S&P 500 ETF Trust
  interval = 'D', // Default to daily interval
  theme = 'dark' // Default to dark theme
}) => {
  // Reference to the container div for the TradingView widget
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  
  // State to manage error messages
  const [error, setError] = useState<string | null>(null);
  
  // State to manage the current chart type
  const [chartType, setChartType] = useState<ChartType>(ChartType.ShortInterest);
  
  // State to manage the current symbol being displayed
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
  
  // State to manage the input field for changing symbols
  const [inputSymbol, setInputSymbol] = useState('');

  /**
   * Cleanup function to remove the TradingView widget.
   * @function
   */
  const cleanupWidget = useCallback(() => {
    // If the container ref exists, clear its contents
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  /**
   * Creates the configuration object for the TradingView widget.
   * @function
   * @param {ChartType} type - The chart type to configure
   * @param {string} sym - The current symbol for the chart
   * @returns {Object} The configuration object for TradingView widget
   */
  const createWidgetConfig = useCallback((type: ChartType, sym: string) => {
    // Extract the stock symbol without the exchange prefix
    const stockSymbol = sym.split(':').pop() || sym;

    // Define the base configuration for the TradingView widget
    const baseConfig = {
      autosize: true, // Make the widget responsive
      symbol: sym, // Use the provided symbol
      interval: interval, // Use the provided interval
      timezone: "Etc/UTC", // Use UTC timezone
      theme: theme, // Use the provided theme
      style: "8", // Chart style (8 is 'Western' style)
      locale: "en", // Use English locale
      backgroundColor: "rgba(0, 0, 0, 1)", // Black background
      gridColor: "rgba(0, 0, 0, 1)", // Black grid color
      toolbar_bg: "rgba(0, 0, 0, 1)", // Black toolbar background
      enable_publishing: false, // Disable publishing feature
      withdateranges: true, // Show date range selector
      hide_side_toolbar: false, // Show side toolbar
      allow_symbol_change: true, // Allow changing the symbol
      details: true, // Show details
      hotlist: true, // Show hotlist
      calendar: true, // Show calendar
      show_popup_button: true, // Show popup button
      popup_width: "1000", // Popup width
      popup_height: "650", // Popup height
      container_id: containerRef.current?.id, // ID of the container element
    };

    // Define compare symbols and studies based on the chart type
    let compareSymbols: CompareSymbol[] = [];
    let studies: string[] = [];

    // Configure compare symbols and studies based on the selected chart type
    switch (type) {
      case ChartType.ShortInterest:
        compareSymbols = [{
          symbol: `FINRA:${stockSymbol}_SHORT_VOLUME`,
          title: "Short Volume",
          position: "NewPane"
        }];
        studies = ["STD;Visible%1Average%1Price","MFI@tv-basicstudies"]; // Money Flow Index study
        break;
      case ChartType.MACD:
        compareSymbols = [{
          symbol: "CME_MINI:NQ1!", // Nasdaq 100 futures
          position: "NewPriceScale"
        }];
        studies = ["MACD@tv-basicstudies"];
        break;
      case ChartType.RSI:
        compareSymbols = [{
          symbol: "CME_MINI:ES1!", // S&P 500 futures
          position: "NewPriceScale"
        }];
        studies = ["RSI@tv-basicstudies"];
        break;
      case ChartType.OBV:
        studies = ["OBV@tv-basicstudies"];
        break;
      case ChartType.AD:
        studies = ["ACCD@tv-basicstudies"];
        break;
      case ChartType.ATR:
        studies = ["ATR@tv-basicstudies"];
        break;
      case ChartType.SlowStoch:
        studies = ["Stochastic@tv-basicstudies"];
        break;
    }

    // Combine the base configuration with compare symbols and studies
    return {
      ...baseConfig,
      compareSymbols,
      studies,
      studies_overrides: {
        // Default overrides for studies (can be expanded for specific studies)
        "volume.volume.color.0": "#00FFFF", // Cyan color for volume up
        "volume.volume.color.1": "#0000FF", // Blue color for volume down
        "volume.volume.transparency": 50, // 50% transparency for volume
        "MFI@tv-basicstudies.plot.color": "#FF6D00", // Orange color for MFI
        "MFI@tv-basicstudies.plot.linewidth": 2, // Line width for MFI
        "Stochastic@tv-basicstudies.K.color": "#2962FF", // Blue for %K line
        "Stochastic@tv-basicstudies.D.color": "#FF6D00", // Orange for %D line
        "Stochastic@tv-basicstudies.smooth": true, // Smooth the Stochastic
        "Stochastic@tv-basicstudies.k": 14, // %K period
        "Stochastic@tv-basicstudies.d": 3, // %D period
        "Stochastic@tv-basicstudies.upper_band": 80, // Upper band (overbought)
        "Stochastic@tv-basicstudies.lower_band": 20 // Lower band (oversold)
      }
    };
  }, [interval, theme]);

  /**
   * Initializes or reinitializes the TradingView widget.
   * @function
   */
  const initializeWidget = useCallback(() => {
    // Check if the TradingView object is available
    if (window.TradingView && containerRef.current) {
try {
  // Create a new TradingView widget with the current configuration
  new (window.TradingView.widget as any)(createWidgetConfig(chartType, currentSymbol));
  setLoading(false); // Set loading to false as the widget has been initialized
} catch (err) {
  setError("Failed to initialize TradingView widget"); // Set error state if initialization fails
  setLoading(false);
}
    }
  }, [chartType, currentSymbol, createWidgetConfig]);

  /**
   * Handles changes in the chart type.
   * @function
   * @param {ChartType} type - The new chart type
   */
  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type); // Update the chart type state
    cleanupWidget(); // Clean up the existing widget
    initializeWidget(); // Reinitialize the widget with the new chart type
  }, [cleanupWidget, initializeWidget]);

  /**
   * Handles changes in the symbol.
   * @function
   * @param {string} newSymbol - The new symbol to display
   */
  const handleSymbolChange = (newSymbol: string) => {
    setCurrentSymbol(newSymbol);
    cleanupWidget();
    initializeWidget();
  };

  /**
   * Effect to load the TradingView library and initialize the widget.
   * @effect
   */
  useEffect(() => {
    // Create a new script element for the TradingView library
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    script.onload = initializeWidget; // Initialize widget when script loads

    // Define what happens if the script fails to load
    script.onerror = () => {
      setError("Failed to load TradingView library");
      setLoading(false);
    };

    document.head.appendChild(script); // Add the script to the document head

    // Cleanup function to remove the script and widget when component unmounts
    return () => {
      cleanupWidget();
      document.head.removeChild(script);
    };
  }, [initializeWidget, cleanupWidget]);

  /**
   * Effect to handle keyboard navigation for chart types.
   * @effect
   */
  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get an array of all chart types
      const chartTypes = Object.values(ChartType);
      // Find the index of the current chart type
      const currentIndex = chartTypes.indexOf(chartType);
      if (event.key === 'ArrowLeft') {
        // Move to the previous chart type (wrap around if at the start)
        const newIndex = (currentIndex - 1 + chartTypes.length) % chartTypes.length;
        handleChartTypeChange(chartTypes[newIndex]);
      } else if (event.key === 'ArrowRight') {
        // Move to the next chart type (wrap around if at the end)
        const newIndex = (currentIndex + 1) % chartTypes.length;
        handleChartTypeChange(chartTypes[newIndex]);
      }
    };

    // Add the event listener for keydown events
    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chartType, handleChartTypeChange]);

  /**
   * Handles form submission for changing the symbol
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (inputSymbol.trim() !== '') {
      handleSymbolChange(inputSymbol); // Change the symbol if input is not empty
      setInputSymbol(''); // Clear the input field after submission
    }
  };

  // If there's an error, render an error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the TradingView widget with controls
  return (
    <div className="flex flex-col h-full">
      {/* Controls section */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2 p-2 bg-gray-800">
        {/* Form for manual symbol input */}
        <form onSubmit={handleSubmit} className="w-full sm:w-auto">
          <input
            type="text"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            placeholder="Enter symbol..."
            className="w-full sm:w-64 px-2 py-1 rounded text-black"
          />
        </form>
        {/* Dropdown for watchlist */}
        <div className="relative w-full sm:w-auto">
          <select
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="appearance-none w-full sm:w-64 bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="">Select from watchlist</option>
            {WATCHLIST.map((symbol) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {/* Chart type selection buttons */}
        <div className="flex flex-wrap justify-center sm:justify-end space-x-2">
          {Object.values(ChartType).map((type) => (
            <button
              key={type}
              onClick={() => handleChartTypeChange(type)}
              className={`px-2 py-1 rounded text-xs ${
                chartType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      {/* Container for the TradingView widget */}
      <div className="flex-grow relative">
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
            <div className="text-white">Loading TradingView widget...</div>
          </div>
        )}
        {/* TradingView widget container */}
        <div id="tradingview_widget" ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default TradingViewWidget;