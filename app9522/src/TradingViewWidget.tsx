/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget with a menu for different chart types.
 */

// Import necessary React hooks and types
import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Enum for different chart types
 * Each value represents a different chart configuration
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
 * @typedef {Object} TradingViewWidgetProps
 * @property {string} [symbol='NASDAQ:NVDA'] - The default symbol to display on the chart
 * @property {string} [interval='D'] - The default time interval for the chart (e.g., 'D' for daily)
 * @property {('light'|'dark')} [theme='dark'] - The color theme of the widget
 */
interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

/**
 * Interface for compare symbol configuration
 * Used to add additional symbols to the chart for comparison
 */
interface CompareSymbol {
  symbol: string; // The symbol to compare (e.g., 'NASDAQ:AAPL')
  title?: string; // Optional title for the compare symbol
  position: string; // Position on the chart (e.g., 'NewPriceScale')
}

/**
 * Extends the global Window interface to include the TradingView property
 * This is necessary because TypeScript doesn't know about the TradingView object by default
 */
declare global {
  interface Window {
    TradingView: any; // 'any' is used because we don't have exact typings for the TradingView object
  }
}

/**
 * TradingViewWidget component
 * Renders a TradingView chart with configurable options and chart types
 *
 * @param {TradingViewWidgetProps} props - The props for the TradingViewWidget component
 * @returns {JSX.Element} The rendered TradingView widget with menu
 */
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'NASDAQ:NVDA', // Default symbol is NVIDIA
  interval = 'D', // Default interval is daily
  theme = 'dark' // Default theme is dark
}) => {
  // Reference to the container div element where the TradingView widget will be rendered
  const containerRef = useRef<HTMLDivElement>(null);

  // State to track loading status of the widget
  const [loading, setLoading] = useState(true);

  // State to track error status if widget fails to load
  const [error, setError] = useState<string | null>(null);

  // State to track the current chart type
  const [chartType, setChartType] = useState<ChartType>(ChartType.ShortInterest);

  // State to track the current symbol being displayed
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  /**
   * Cleanup function to remove the TradingView widget
   * This is used when reinitializing the widget or unmounting the component
   */
  const cleanupWidget = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''; // Clear the container's content
    }
  }, []);

  /**
   * Function to create TradingView widget configuration
   * This function generates the configuration object based on the current chart type and symbol
   *
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
      watchlist: [ // Predefined watchlist
        "NASDAQ:AMAT",
        "NASDAQ:ARM",
        "NASDAQ:QCOM",
        "NASDAQ:NVDA",
        "NYSE:TSM"
      ],
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
   * Function to initialize or reinitialize the TradingView widget
   * This is called when the component mounts or when the chart type or symbol changes
   */
  const initializeWidget = useCallback(() => {
    // Check if the TradingView object is available
    if (window.TradingView && containerRef.current) {
      try {
        // Create a new TradingView widget with the current configuration
        new window.TradingView.widget(createWidgetConfig(chartType, currentSymbol));
        setLoading(false); // Set loading to false as the widget has been initialized
      } catch (err) {
        setError("Failed to initialize TradingView widget"); // Set error state if initialization fails
        setLoading(false);
      }
    }
  }, [chartType, currentSymbol, createWidgetConfig]);

  /**
   * Function to handle chart type change
   * This is called when the user selects a different chart type from the menu
   *
   * @param {ChartType} type - The new chart type
   */
  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type); // Update the chart type state
    cleanupWidget(); // Clean up the existing widget
    initializeWidget(); // Reinitialize the widget with the new chart type
  }, [cleanupWidget, initializeWidget]);

  /**
   * Effect to load the TradingView library and initialize the widget
   * This runs once when the component mounts
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
   * Effect to handle symbol changes
   * This effect runs whenever the 'symbol' prop changes
   */
  useEffect(() => {
    if (symbol !== currentSymbol) {
      setCurrentSymbol(symbol); // Update the current symbol state
      cleanupWidget(); // Clean up the existing widget
      initializeWidget(); // Initialize the new widget with the new symbol
    }
  }, [symbol, currentSymbol, cleanupWidget, initializeWidget]);

  /**
   * Effect to periodically check the current symbol and update the configuration
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.TradingView && containerRef.current) {
        const widgets = window.TradingView.widgets;
        if (widgets && widgets.length > 0) {
          const widget = widgets[0];
          if (widget && widget.chart().symbol() !== currentSymbol) {
            setCurrentSymbol(widget.chart().symbol());
            cleanupWidget();
    // Initialize the new widget with current symbol and chart type
    // This will update the main chart and the "_SHORT_VOLUME" chart in the "NewPane"
            initializeWidget();
          }
        }
      }
    }, 1000); // Check every second

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [currentSymbol, cleanupWidget, initializeWidget]);

  /**
   * Effect to handle keyboard navigation
   * This allows users to switch between chart types using left and right arrow keys
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

  // If there's an error, render an error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the TradingView widget with menu
  return (
    <div className="flex flex-col h-full">
      {/* Menu for chart type selection */}
      <div className="flex justify-center space-x-2 p-2 bg-gray-800">
        {Object.values(ChartType).map((type) => (
          <button
            key={type}
            onClick={() => handleChartTypeChange(type)}
            className={`px-4 py-2 rounded ${
              chartType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {type}
          </button>
        ))}
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