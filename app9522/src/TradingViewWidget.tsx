/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget with improved UI and functionality.
 * This component allows users to view various technical indicators and compare multiple symbols on a single chart.
 */

// Import necessary React hooks and types
import React, { useEffect, useRef, useState, useCallback } from 'react';
// Import ChevronDown icon from Lucide React for custom dropdown styling
import { ChevronDown } from 'lucide-react';
import { ChartType } from './types'; // Import ChartType enum
import { getChartConfig } from './chartConfigurations'; // Import the chart configuration function

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
 * Predefined watchlist of ticker symbols
 */
const WATCHLIST = ["AMEX:SPY", "NASDAQ:AMAT", "NASDAQ:ARM", "NASDAQ:QCOM", "NASDAQ:NVDA", "NYSE:TSM"];

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
  // Get the chart configuration for the current type and symbol
  const chartConfig = getChartConfig(type, sym);

  // Define the base configuration for the TradingView widget
  const baseConfig = {
    autosize: true,
    symbol: sym,
    interval: interval,
    timezone: "Etc/UTC",
    theme: theme,
    style: "8",
    locale: "en",
    gridColor: "rgba(0, 0, 0, 0)",
    enable_publishing: false,
    withdateranges: true,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    details: true,
    hotlist: true,
    calendar: true,
    show_popup_button: true,
    popup_width: "1000",
    popup_height: "650",
    container_id: containerRef.current?.id,
        
    // Define the chart structure with two panes
    charts: [
      { height: 85 }, // Main chart pane takes 85% of the height
      { height: 15 }, // Indicator pane takes 15% of the height
    ],

    // Updated overrides for Heikin-Ashi candle colors and volume
    overrides: {
      "mainSeriesProperties.haStyle.upColor": "rgba(238, 130, 238, 0.05)", // Violet with 5% opacity for up Heikin-Ashi candles
      "mainSeriesProperties.haStyle.downColor": "rgba(255, 255, 255, 0.05)", // White with 5% opacity for down Heikin-Ashi candles
      "mainSeriesProperties.haStyle.drawWick": true,
      "mainSeriesProperties.haStyle.drawBorder": true,
      "mainSeriesProperties.haStyle.borderUpColor": "rgb(238, 130, 238)", // Solid violet border for up Heikin-Ashi candles
      "mainSeriesProperties.haStyle.borderDownColor": "#FFFFFF", // Black border for down Heikin-Ashi candles
      "mainSeriesProperties.haStyle.wickUpColor": "rgb(238, 130, 238)", // Solid violet wick for up Heikin-Ashi candles
      "mainSeriesProperties.haStyle.wickDownColor": "#FFFFFF", // Black wick for down Heikin-Ashi candles
    }
  };

    // Combine the base configuration with the chart-specific configuration
    return {
      ...baseConfig,
      ...chartConfig,
      studies_overrides: {
        "volume.volume.color.0": "rgba(211, 211, 211, 0.2)",
        "volume.volume.color.1": "rgba(169, 169, 169, 0.1)",
        "volume.volume.transparency": 50,
        "MF@tv-basicstudies.plot.color": "#FF6D00",
        "MF@tv-basicstudies.plot.linewidth": 2,
        "Stochastic@tv-basicstudies.K.color": "#2962FF",
        "Stochastic@tv-basicstudies.D.color": "#FF6D00",
        "Stochastic@tv-basicstudies.smooth": true,
        "Stochastic@tv-basicstudies.k": 14,
        "Stochastic@tv-basicstudies.d": 3,
        "Stochastic@tv-basicstudies.upper_band": 80,
        "Stochastic@tv-basicstudies.lower_band": 20,
        "LinearRegression@tv-basicstudies.linewidth": 2,
        "LinearRegression@tv-basicstudies.upper_band.color": "#FF9900",
        "LinearRegression@tv-basicstudies.lower_band.color": "#FF9900",
        "LinearRegression@tv-basicstudies.source": "close",
        "LinearRegression@tv-basicstudies.period": 100
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
            <option value="">Select from watchlist</option>
            {WATCHLIST.map((symbol) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          {/* Custom dropdown icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <ChevronDown size={20} />
          </div>
        </div>
        {/* Chart type selection buttons */}
        <div className="flex flex-wrap justify-center sm:justify-end space-x-2">
        {Object.values(ChartType).map((type) => (
  <button
    key={type as string}
    onClick={() => handleChartTypeChange(type as ChartType)}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      chartType === type
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    }`}
  >
    {type as string}
  </button>
))}
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