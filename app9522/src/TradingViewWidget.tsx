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
  HeikinAshi = 'Heikin-Ashi',
  MACD = 'MACD',
  RSI = 'RSI',
  OBV = 'OBV',
  AD = 'AD',
  ATR = 'ATR',
  DMI = 'DMI'
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
  const [chartType, setChartType] = useState<ChartType>(ChartType.HeikinAshi);

  /**
   * Cleanup function to remove the TradingView widget
   */
  const cleanupWidget = useCallback(() => {
    // Check if the container ref is available
    if (containerRef.current) {
      // Clear the contents of the container
      containerRef.current.innerHTML = '';
    }
  }, []);

  /**
 * Function to create TradingView widget configuration
 * @param {ChartType} type - The chart type to configure
 * @returns {Object} The configuration object for TradingView widget
 */
const createWidgetConfig = useCallback((type: ChartType) => {
  // Extract the stock symbol without the exchange prefix
  const stockSymbol = symbol.split(':').pop() || 'NVDA';

  // Define the base configuration for the TradingView widget
  const baseConfig = {
    autosize: true,
    symbol: symbol,
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
      "NASDAQ:NVDA",
      "NYSE:TSM"
    ],
    compareSymbols: [
      {
        // Dynamically generate the short volume symbol
        "symbol": `FINRA:${stockSymbol}_SHORT_VOLUME`,
        "position": "NewPane"
      },
      {
        "symbol": "CME_MINI:ES1!",
        "position": "NewPriceScale"
      }
    ],
    details: true,
    hotlist: true,
    calendar: true,
    show_popup_button: true,
    popup_width: "1000",
    popup_height: "650",
    container_id: containerRef.current?.id,
  };

  // Add specific studies based on the chart type
  switch (type) {
    case ChartType.MACD:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price", "MACD@tv-basicstudies"] };
    case ChartType.RSI:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price", "RSI@tv-basicstudies"] };
    case ChartType.OBV:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price", "OBV@tv-basicstudies"] };
    case ChartType.AD:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price", "ACCDIST@tv-basicstudies"] };
    case ChartType.ATR:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price", "ATR@tv-basicstudies"] };
    case ChartType.DMI:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price", "DMI@tv-basicstudies"] };
    default:
      return { ...baseConfig, studies: ["STD;Visible%1Average%1Price"] };
  }
}, [symbol, interval, theme]);

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
    if (containerRef.current) {
      new window.TradingView.widget(createWidgetConfig(type));
    }
  }, [cleanupWidget, createWidgetConfig]);

  /**
   * Effect to load and initialize the TradingView widget
   */
  useEffect(() => {
    // Create a new script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    // Define the onload handler for the script
    script.onload = () => {
      if (containerRef.current) {
        try {
          // Initialize the TradingView widget
          new window.TradingView.widget(createWidgetConfig(chartType));
          setLoading(false);
        } catch (err) {
          setError("Failed to initialize TradingView widget");
          setLoading(false);
        }
      }
    };

    // Define the onerror handler for the script
    script.onerror = () => {
      setError("Failed to load TradingView library");
      setLoading(false);
    };

    // Append the script to the document head
    document.head.appendChild(script);

    // Cleanup function to remove the script and widget when component unmounts
    return () => {
      cleanupWidget();
      document.head.removeChild(script);
    };
  }, [chartType, cleanupWidget, createWidgetConfig]);

  /**
   * Effect to handle keyboard navigation
   */
  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      const chartTypes = Object.values(ChartType);
      const currentIndex = chartTypes.indexOf(chartType);
      if (event.key === 'ArrowLeft') {
        // Move to the previous chart type
        const newIndex = (currentIndex - 1 + chartTypes.length) % chartTypes.length;
        handleChartTypeChange(chartTypes[newIndex]);
      } else if (event.key === 'ArrowRight') {
        // Move to the next chart type
        const newIndex = (currentIndex + 1) % chartTypes.length;
        handleChartTypeChange(chartTypes[newIndex]);
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chartType, handleChartTypeChange]);

  // Render error message if there's an error
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