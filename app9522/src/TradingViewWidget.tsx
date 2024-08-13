/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget with improved UI and functionality.
 * This component allows users to view various technical indicators and compare multiple symbols on a single chart.
 */

// Import necessary React hooks and types
import React, { useEffect, useRef, useState, useCallback } from 'react';
// Import ChevronDown icon from Lucide React for custom dropdown styling
import { ChevronDown } from 'lucide-react';
// Import ChartType enum from types file
import { ChartType } from './types';
// Import the chart configuration function
import { getChartConfig } from './chartConfigurations';

/**
 * Props for the TradingViewWidget component
 * @interface TradingViewWidgetProps
 * @property {string} [initialSymbol='AMEX:SPY'] - The default symbol to display on the chart (e.g., 'NASDAQ:AAPL' for Apple Inc.)
 * @property {string} [interval='D'] - The default time interval for the chart (e.g., 'D' for daily, 'W' for weekly, '60' for 60 minutes)
 * @property {('light'|'dark')} [theme='dark'] - The color theme of the widget
 */
interface TradingViewWidgetProps {
  /** The initial symbol to display on the chart (default: 'AMEX:SPY') */
  initialSymbol?: string;
  /** The default time interval for the chart (default: 'D' for daily) */
  interval?: string;
  /** The color theme of the widget (default: 'dark') */
  theme?: 'light' | 'dark';
}

/**
 * Predefined watchlist of ticker symbols for semiconductors
 * @constant {string[]}
 */
const WATCHLIST = [
  "NASDAQ:MRVL", "NASDAQ:ASML", "NASDAQ:KLAC", "NASDAQ:INTC", "NASDAQ:AVGO",
  "NASDAQ:SMCI", "NASDAQ:NVDA", "NASDAQ:LRCX", "NASDAQ:AMAT", "NASDAQ:TXN",
  "NASDAQ:ON", "NASDAQ:MU", "NASDAQ:QCOM", "NASDAQ:AMD", "NASDAQ:ARM",
  "NYSE:TSM", "NYSE:UMC", "NASDAQ:MCHP", "NASDAQ:ADI", "NASDAQ:NXPI",
  "KRX:000660", "TWSE:6533", "KRX:005930"
];

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
 * <TradingViewWidget initialSymbol="NASDAQ:AAPL" interval="60" />
 *
 * @param {TradingViewWidgetProps} props - The props for the TradingViewWidget component
 * @returns {JSX.Element} The rendered TradingView widget with menu
 */
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  // Default to SPDR S&P 500 ETF Trust if no initial symbol is provided
  initialSymbol = 'AMEX:SPY',
  // Default to daily interval if no interval is provided
  interval = 'D',
  // Default to dark theme if no theme is provided
  theme = 'dark'
}) => {
  // Reference to the container div for the TradingView widget
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to manage loading status of the widget
  const [loading, setLoading] = useState(true);
  
  // State to manage error messages if widget fails to load
  const [error, setError] = useState<string | null>(null);
  
  // State to manage the current chart type (indicator)
  const [chartType, setChartType] = useState<ChartType>(ChartType.ShortInterest);
  
  // State to manage the current symbol being displayed on the chart
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
  
  // State to manage the input field for changing symbols
  const [inputSymbol, setInputSymbol] = useState('');

  /**
   * Cleanup function to remove the TradingView widget.
   * This function is memoized to prevent unnecessary re-renders.
   * @function
   */
  const cleanupWidget = useCallback(() => {
    // If the container ref exists, clear its contents
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []); // Empty dependency array as this function doesn't depend on any external variables

  /**
   * Creates the configuration object for the TradingView widget.
   * This function is memoized to prevent unnecessary re-computations.
   * @function
   * @param {ChartType} type - The chart type to configure
   * @param {string} sym - The current symbol for the chart
   * @returns {Object} The configuration object for TradingView widget
   */
  const createWidgetConfig = useCallback((type: ChartType, sym: string) => {
    // Get the chart configuration for the current type and symbol
    const chartConfig = getChartConfig(type, sym);

    // Define the base configuration for the TradingView widget
    const baseConfig = {
      autosize: true, // Allow the widget to resize automatically
      symbol: sym, // The symbol to display on the chart
      interval: interval, // The time interval for the chart
      timezone: "Etc/UTC", // Set the timezone to UTC
      theme: theme, // Set the color theme (light or dark)
      style: "8", // Set the chart style (8 is for Heikin-Ashi candles)
      locale: "en", // Set the language to English
      gridColor: "rgba(0, 0, 0, 0)", // Set grid color to transparent
      enable_publishing: false, // Disable publishing feature
      withdateranges: true, // Show date range selector
      hide_side_toolbar: false, // Show side toolbar
      allow_symbol_change: true, // Allow changing the symbol from the widget
      details: true, // Show instrument details
      hotlist: true, // Show hotlist
      calendar: true, // Show calendar events
      show_popup_button: true, // Show popup button
      popup_width: "1000", // Set popup width
      popup_height: "650", // Set popup height
      container_id: containerRef.current?.id, // Set the container ID for the widget
          
      // Define the chart structure with two panes
      charts: [
        { height: 85 }, // Main chart pane takes 85% of the height
        { height: 15 }, // Indicator pane takes 15% of the height
      ],

      // Define overrides for Heikin-Ashi candle colors and volume
      overrides: {
        "mainSeriesProperties.haStyle.upColor": "rgba(238, 130, 238, 0.05)", // Violet with 5% opacity for up Heikin-Ashi candles
        "mainSeriesProperties.haStyle.downColor": "rgba(255, 255, 255, 0.05)", // White with 5% opacity for down Heikin-Ashi candles
        "mainSeriesProperties.haStyle.drawWick": true, // Draw wick for Heikin-Ashi candles
        "mainSeriesProperties.haStyle.drawBorder": true, // Draw border for Heikin-Ashi candles
        "mainSeriesProperties.haStyle.borderUpColor": "rgb(238, 130, 238)", // Solid violet border for up Heikin-Ashi candles
        "mainSeriesProperties.haStyle.borderDownColor": "#FFFFFF", // White border for down Heikin-Ashi candles
        "mainSeriesProperties.haStyle.wickUpColor": "rgb(238, 130, 238)", // Solid violet wick for up Heikin-Ashi candles
        "mainSeriesProperties.haStyle.wickDownColor": "#FFFFFF", // White wick for down Heikin-Ashi candles
      }
    };

    // Combine the base configuration with the chart-specific configuration
    return {
      ...baseConfig,
      ...chartConfig,
      // Override study colors and settings
      studies_overrides: {
        "volume.volume.color.0": "rgba(211, 211, 211, 0.2)", // Light gray for volume bars (selling volume)
        "volume.volume.color.1": "rgba(169, 169, 169, 0.1)", // Dark gray for volume bars (buying volume)
        "volume.volume.transparency": 50, // Set volume bars transparency
        "MF@tv-basicstudies.plot.color": "#FF6D00", // Orange color for Money Flow
        "MF@tv-basicstudies.plot.linewidth": 2, // Line width for Money Flow
        "Stochastic@tv-basicstudies.K.color": "#2962FF", // Blue color for Stochastic %K line
        "Stochastic@tv-basicstudies.D.color": "#FF6D00", // Orange color for Stochastic %D line
        "Stochastic@tv-basicstudies.smooth": true, // Enable smoothing for Stochastic
        "Stochastic@tv-basicstudies.k": 14, // Set %K period for Stochastic
        "Stochastic@tv-basicstudies.d": 3, // Set %D period for Stochastic
        "Stochastic@tv-basicstudies.upper_band": 80, // Set upper band for Stochastic
        "Stochastic@tv-basicstudies.lower_band": 20, // Set lower band for Stochastic
        "LinearRegression@tv-basicstudies.linewidth": 2, // Line width for Linear Regression
        "LinearRegression@tv-basicstudies.upper_band.color": "#FF9900", // Orange color for upper Linear Regression band
        "LinearRegression@tv-basicstudies.lower_band.color": "#FF9900", // Orange color for lower Linear Regression band
        "LinearRegression@tv-basicstudies.source": "close", // Use close price for Linear Regression calculation
        "LinearRegression@tv-basicstudies.period": 100 // Set period for Linear Regression
      }
    };
  }, [interval, theme]); // Dependencies for this memoized function

  /**
   * Initializes or reinitializes the TradingView widget.
   * This function is memoized to prevent unnecessary re-renders.
   * @function
   */
  const initializeWidget = useCallback(() => {
    // Check if the TradingView object is available in the global scope
    if (window.TradingView && containerRef.current) {
      try {
        // Create a new TradingView widget with the current configuration
        new (window.TradingView.widget as any)(createWidgetConfig(chartType, currentSymbol));
        setLoading(false); // Set loading to false as the widget has been initialized
      } catch (err) {
        setError("Failed to initialize TradingView widget"); // Set error state if initialization fails
        setLoading(false); // Set loading to false even if there's an error
      }
    }
  }, [chartType, currentSymbol, createWidgetConfig]); // Dependencies for this memoized function

  /**
   * Handles changes in the chart type (indicator).
   * This function is memoized to prevent unnecessary re-renders.
   * @function
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event from the select element
   */
  const handleChartTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as ChartType; // Cast the selected value to ChartType
    setChartType(newType); // Update the chart type state
    cleanupWidget(); // Clean up the existing widget
    initializeWidget(); // Reinitialize the widget with the new chart type
  }, [cleanupWidget, initializeWidget]); // Dependencies for this memoized function

  /**
   * Handles changes in the symbol.
   * @function
   * @param {string} newSymbol - The new symbol to display
   */
  const handleSymbolChange = (newSymbol: string) => {
    setCurrentSymbol(newSymbol); // Update the current symbol state
    cleanupWidget(); // Clean up the existing widget
    initializeWidget(); // Reinitialize the widget with the new symbol
  };

  /**
   * Effect to load the TradingView library and initialize the widget.
   * This effect runs once when the component mounts.
   * @effect
   */
  useEffect(() => {
    // Create a new script element for the TradingView library
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    // Set up onload handler to initialize widget when script loads
    script.onload = initializeWidget;

    // Define what happens if the script fails to load
    script.onerror = () => {
      setError("Failed to load TradingView library");
      setLoading(false);
    };

    // Add the script to the document head
    document.head.appendChild(script);

    // Cleanup function to remove the script and widget when component unmounts
    return () => {
      cleanupWidget();
      document.head.removeChild(script);
    };
  }, [initializeWidget, cleanupWidget]); // Dependencies for this effect

  /**
   * Effect to handle keyboard navigation for chart types.
   * This effect sets up and cleans up event listeners for keyboard navigation.
   * @effect
   */
  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get an array of all chart types
      const chartTypes = Object.values(ChartType);
      // Find the index of the current chart type
      const currentIndex = chartTypes.indexOf(chartType);
      let newIndex: number;

      // Handle arrow key navigation
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        // Move to the previous chart type (wrap around if at the start)
        newIndex = (currentIndex - 1 + chartTypes.length) % chartTypes.length;
        setChartType(chartTypes[newIndex]);
        cleanupWidget();
        initializeWidget();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        // Move to the next chart type (wrap around if at the end)
        newIndex = (currentIndex + 1) % chartTypes.length;
        setChartType(chartTypes[newIndex]);
        cleanupWidget();
        initializeWidget();
      }
    };

    // Add the event listener for keydown events
    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chartType, cleanupWidget, initializeWidget]); // Dependencies for this effect

/**
   * Handles form submission for changing the symbol
   * @function
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
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

// Render the TradingView widget with improved controls
return (
  <div className="flex flex-col h-full bg-gray-900 text-white">
    {/* Controls section */}
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2 p-4 bg-gray-800">
      {/* Symbol input form */}
      <form onSubmit={handleSubmit} className="w-full sm:w-auto">
        <input
          type="text"
          value={inputSymbol}
          onChange={(e) => setInputSymbol(e.target.value)}
          placeholder="Enter symbol..."
          className="w-full sm:w-64 px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </form>
      {/* Watchlist dropdown */}
      <div className="relative w-full sm:w-64">
        <select
          onChange={(e) => handleSymbolChange(e.target.value)}
          className="appearance-none w-full bg-gray-700 border border-gray-600 text-white py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500 transition-colors"
        >
          <option value="">SEMICONDUCTORS</option>
          {WATCHLIST.map((symbol) => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
        {/* Custom dropdown icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <ChevronDown size={20} />
        </div>
      </div>
      {/* Chart type (indicator) dropdown */}
      <div className="relative w-full sm:w-64">
        <select
          value={chartType}
          onChange={handleChartTypeChange}
          className="appearance-none w-full bg-gray-700 border border-gray-600 text-white py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500 transition-colors"
        >
          {Object.values(ChartType).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {/* Custom dropdown icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
    {/* Container for the TradingView widget */}
    <div className="flex-grow relative">
      {/* Loading indicator with improved styling */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
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