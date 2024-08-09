/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget.
 * This component uses the TradingView external embedding script to display
 * a fully-featured chart with customizable settings.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Props for the TradingViewWidget component.
 * @typedef {Object} TradingViewWidgetProps
 * @property {string} [symbol='NASDAQ:NVDA'] - The default symbol to display on the chart.
 * @property {string} [interval='D'] - The default time interval for the chart.
 * @property {('light'|'dark')} [theme='dark'] - The color theme of the widget.
 */
interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

/**
 * Extends the global Window interface to include the TradingView property.
 */
declare global {
  interface Window {
    TradingView: any;
  }
}

/**
 * TradingViewWidget component
 * @param {TradingViewWidgetProps} props - The props for the TradingViewWidget component
 * @returns {JSX.Element} The rendered TradingView widget
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

  /**
   * Cleanup function to remove the TradingView widget
   */
  const cleanupWidget = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    // Create a script element to load the TradingView library
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    /**
     * Callback function when the script is loaded successfully
     */
    script.onload = () => {
      if (containerRef.current) {
        try {
          // Initialize the TradingView widget
          new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: "Etc/UTC",
            theme: theme,
            style: "8",
            locale: "en",
            backgroundColor: "rgba(0, 0, 0, 1)",
            gridColor: "rgba(0, 0, 0, 1)",
            withdateranges: true,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            watchlist: [
              symbol
            ],
            compareSymbols: [
              {
                "symbol": "FINRA:NVDA_SHORT_VOLUME",
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
            studies: [
              "STD;Visible%1Average%1Price"
            ],
            show_popup_button: true,
            popup_width: "1000",
            popup_height: "650",
            container_id: containerRef.current.id,
          });
          setLoading(false);
        } catch (err) {
          setError("Failed to initialize TradingView widget");
          setLoading(false);
        }
      }
    };

    /**
     * Callback function when the script fails to load
     */
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
  }, [symbol, interval, theme, cleanupWidget]);

  // Render error message if there's an error
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the TradingView widget
  return (
    <div style={{ height: "100%", width: "100%" }}>
      {loading && <div>Loading TradingView widget...</div>}
      <div id="tradingview_widget" ref={containerRef} style={{ height: "calc(100% - 32px)", width: "100%" }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default TradingViewWidget;