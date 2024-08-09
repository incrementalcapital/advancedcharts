/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget with a menu for different chart types.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Enum for different chart types
 * @enum {string}
 */
enum ChartType {
  ShortInterest = 'Short Interest', // New chart type replacing HeikinAshi
  MACD = 'MACD',
  RSI = 'RSI',
  OBV = 'OBV',
  AD = 'AD',
  ATR = 'ATR',
  SlowStoch = 'Slow Stochastic'
}

/**
 * Props for the TradingViewWidget component
 * @typedef {Object} TradingViewWidgetProps
 * @property {string} [symbol='NASDAQ:NVDA'] - The default symbol to display on the chart
 * @property {string} [interval='D'] - The default time interval for the chart
 * @property {('light'|'dark')} [theme='dark'] - The color theme of the widget
 */
interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

/**
 * Extends the global Window interface to include the TradingView property
 */
declare global {
  interface Window {
    TradingView: any;
  }
}

/**
 * TradingViewWidget component
 * @param {TradingViewWidgetProps} props - The props for the TradingViewWidget component
 * @returns {JSX.Element} The rendered TradingView widget with menu
 */
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'NASDAQ:NVDA',
  interval = 'D',
  theme = 'dark'
}) => {
  // Reference to the container div element
  const containerRef = useRef<HTMLDivElement>(null);

  // State to track loading status
  const [loading, setLoading] = useState(true);

  // State to track error status
  const [error, setError] = useState<string | null>(null);

  // State to track the current chart type
  const [chartType, setChartType] = useState<ChartType>(ChartType.ShortInterest);

  // State to track the current symbol
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  /**
   * Cleanup function to remove the TradingView widget
   */
  const cleanupWidget = useCallback(() => {
    // Check if the container ref is available and has content
    if (containerRef.current) {
      // Clear the contents of the container
      containerRef.current.innerHTML = '';
    }
  }, []);

  /**
   * Function to create TradingView widget configuration
   * @param {ChartType} type - The chart type to configure
   * @param {string} sym - The current symbol for the chart
   * @returns {Object} The configuration object for TradingView widget
   */
  const createWidgetConfig = useCallback((type: ChartType, sym: string) => {
    // Extract the stock symbol without the exchange prefix
  // This line splits the symbol string at the colon and takes the last part
  // If there's no colon, it will use the whole string
  // The || 'NVDA' is a fallback in case the split operation fails
    const stockSymbol = sym.split(':').pop() || 'NVDA';

    // Define the base configuration for the TradingView widget
    const baseConfig = {
      autosize: true,
    symbol: sym,  // Use the provided symbol here
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "8",
      locale: "en",
      backgroundColor: "rgba(0, 0, 0, 1)",
      gridColor: "rgba(0, 0, 0, 1)",
      toolbar_bg: "rgba(0, 0, 0, 1)",
      enable_publishing: false,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      watchlist: [
        "NASDAQ:AMAT",
        "NASDAQ:ARM",
        "NASDAQ:QCOM",
        "NASDAQ:NVDA",
        "NYSE:TSM"
      ],
      details: true,
      hotlist: true,
      calendar: true,
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      container_id: containerRef.current?.id,
    };

    // Define compare symbols and studies based on the chart type
    let compareSymbols = [];
    let studies = [];

    switch (type) {
      case ChartType.ShortInterest:
        // For Short Interest, we add the short volume as a compare symbol and MFI as a study
        compareSymbols = [{
          "symbol": `FINRA:${stockSymbol}_SHORT_VOLUME`,
          "title": "Short Volume",
          "position": "NewPriceScale" // Changed from "NewPane" to "NewPriceScale"
        }];
        studies = ["STD;Visible%1Average%1Price", "MFI@tv-basicstudies"]; // Money Flow Index study
        break;
      case ChartType.MACD:
        compareSymbols = [{
          "symbol": "CME_MINI:NQ1!", // Nasdaq 100 futures
          "position": "NewPriceScale"
        }];
        studies = ["MACD@tv-basicstudies"];
        break;
      case ChartType.RSI:
        compareSymbols = [{
          "symbol": "CME_MINI:ES1!", // S&P 500 futures
          "position": "NewPriceScale"
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
        "volume.volume.color.0": "#00FFFF",
        "volume.volume.color.1": "#0000FF",
        "volume.volume.transparency": 50,
        "MFI@tv-basicstudies.plot.color": "#FF6D00", // Orange color for MFI
        "MFI@tv-basicstudies.plot.linewidth": 2,
        "Stochastic@tv-basicstudies.K.color": "#2962FF", // Blue for %K line
        "Stochastic@tv-basicstudies.D.color": "#FF6D00", // Orange for %D line
        "Stochastic@tv-basicstudies.smooth": true,
        "Stochastic@tv-basicstudies.k": 14,
        "Stochastic@tv-basicstudies.d": 3,
        "Stochastic@tv-basicstudies.upper_band": 80,
        "Stochastic@tv-basicstudies.lower_band": 20
      }
    };
  }, [interval, theme]);

  /**
   * Function to initialize or reinitialize the TradingView widget
   */
  const initializeWidget = useCallback(() => {
    // Check if the TradingView object is available
    if (window.TradingView && containerRef.current) {
      try {
        // Create a new TradingView widget with the current configuration
        new window.TradingView.widget(createWidgetConfig(chartType, currentSymbol));
        // Set loading to false as the widget has been initialized
        setLoading(false);
      } catch (err) {
        // If there's an error, set the error state and stop loading
        setError("Failed to initialize TradingView widget");
        setLoading(false);
      }
    }
  }, [chartType, currentSymbol, createWidgetConfig]);

  /**
   * Function to handle chart type change
   * @param {ChartType} type - The new chart type
   */
  const handleChartTypeChange = useCallback((type: ChartType) => {
    // Update the chart type state
    setChartType(type);
    // Clean up the existing widget
    cleanupWidget();
    // Reinitialize the widget with the new chart type
    initializeWidget();
  }, [cleanupWidget, initializeWidget]);

  /**
   * Effect to load the TradingView library and initialize the widget
   */
  useEffect(() => {
    // Create a new script element for the TradingView library
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    // Define what happens when the script loads successfully
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
  }, [initializeWidget, cleanupWidget]);

  /**
   * Effect to handle symbol changes
 * This effect runs whenever the 'symbol' prop changes, which is expected to be frequent
   */
  useEffect(() => {
    if (symbol !== currentSymbol) {
    // Update the current symbol state immediately
    // This ensures that our component always has the latest symbol
      setCurrentSymbol(symbol);
    // Note: Widget reinitialization is handled in the next effect
    }
}, [symbol, currentSymbol]); // Dependencies: only run this effect if 'symbol' or 'currentSymbol' changes

  /**
   * Effect to reinitialize the widget
   * This effect runs whenever currentSymbol or chartType changes
   * It's separate from the symbol update effect to allow for more efficient handling of frequent symbol changes
   */
  useEffect(() => {
    // Clean up the existing widget
    cleanupWidget();
    // Initialize the new widget with current symbol and chart type
    // This will update the main chart and the "_SHORT_VOLUME" chart in the "NewPane"
    initializeWidget();
  // This effect depends on currentSymbol, chartType, and the initializeWidget and cleanupWidget functions
  }, [currentSymbol, chartType, initializeWidget, cleanupWidget]);

  /**
   * Effect to handle keyboard navigation
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