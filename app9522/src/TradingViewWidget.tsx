/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget.
 * This component uses the TradingView external embedding script to display
 * a fully-featured chart with customizable settings.
 */

import React, { useEffect, useRef, useState, memo } from 'react';

/**
 * @typedef {Object} TradingViewWidgetProps
 * @property {string} [symbol='NASDAQ:NVDA'] - The default symbol to display on the chart.
 * @property {string} [interval='D'] - The default time interval for the chart.
 * @property {string} [theme='dark'] - The color theme of the widget ('light' or 'dark').
 */
interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

/**
 * TradingViewWidget component
 * @param {TradingViewWidgetProps} props - The props for the TradingViewWidget component
 * @returns {JSX.Element} The rendered TradingView widget
 */
function TradingViewWidget({ 
  symbol = 'NASDAQ:NVDA', 
  interval = 'D', 
  theme = 'dark' 
}: TradingViewWidgetProps): JSX.Element {
  // Create a ref to hold the container div element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track loading status of the widget
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Store the current value of the ref to use in cleanup
    const container = containerRef.current;

    /**
     * Creates and configures the TradingView widget script
     * @returns {HTMLScriptElement} The configured script element
     */
    const createScript = (): HTMLScriptElement => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "${interval}",
          "timezone": "Etc/UTC",
          "theme": "${theme}",
          "style": "8",
          "locale": "en",
          "backgroundColor": "rgba(0, 0, 0, 1)",
          "gridColor": "rgba(0, 0, 0, 1)",
          "withdateranges": true,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "watchlist": [
            "${symbol}"
          ],
          "compareSymbols": [
            {
              "symbol": "FINRA:NVDA_SHORT_VOLUME",
              "position": "NewPane"
            },
            {
              "symbol": "CME_MINI:ES1!",
              "position": "NewPriceScale"
            }
          ],
          "details": true,
          "hotlist": true,
          "calendar": true,
          "studies": [
              "STD;Visible%1Average%1Price"
            ],
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "support_host": "https://www.tradingview.com"
        }`;
      return script;
    };

    try {
      // Create and append the script to the container
      if (container) {
        const script = createScript();
        container.appendChild(script);

        // Set up event listener for script load completion
        script.onload = () => setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading TradingView widget:', error);
      setIsLoading(false);
    }

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, interval, theme]); // Dependencies array includes props to re-render on changes

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}>
      {isLoading && <div>Loading TradingView widget...</div>}
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(TradingViewWidget);