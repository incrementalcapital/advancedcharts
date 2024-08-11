/**
 * @fileoverview This file contains the AdvancedCharts component, which renders a TradingView chart
 * with a comparison to the short volume data for the given symbol on a new scale, using price mode.
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * Props interface for the AdvancedCharts component.
 * @interface
 */
interface AdvancedChartsProps {
  /** The trading symbol to display on the chart (e.g., "NASDAQ:AAPL") */
  symbol: string;
  /** The width of the chart. Can be a number (interpreted as pixels) or a string (e.g., "100%") */
  width: string | number;
  /** The height of the chart. Can be a number (interpreted as pixels) or a string (e.g., "400px") */
  height: string | number;
}

/**
 * AdvancedCharts component that renders a TradingView chart with a comparison line on a new scale.
 * @param {AdvancedChartsProps} props - The props for the component
 * @returns {JSX.Element} An iframe containing the TradingView chart
 */
const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ symbol, width, height }) => {
  // Create a ref to hold the iframe element
  const containerRef = useRef<HTMLIFrameElement>(null);
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);

  // Use an effect to set up the TradingView widget when the component mounts or props change
  useEffect(() => {
    // Check if the containerRef is available
    if (containerRef.current) {
      // Get a reference to the iframe element
      const iframe = containerRef.current;
      
      // Generate the compare symbol by replacing the exchange prefix with "FINRA" and adding "_SHORT_VOLUME"
      const compareSymbol = `FINRA:${symbol.split(':')[1]}_SHORT_VOLUME`;
      
      // Create the JavaScript code that will run inside the iframe
      const script = `
        // Create a new TradingView widget
        new TradingView.widget({
          symbol: "${symbol}",  // The main symbol to display
          interval: "D",        // Daily interval
          width: ${typeof width === 'number' ? width : `"${width}"`},  // Set the width
          height: ${typeof height === 'number' ? height : `"${height}"`},  // Set the height
          timezone: "Etc/UTC",  // Use UTC timezone
          theme: "light",       // Use light theme
          style: "1",           // Chart style (1 is the default style)
          locale: "en",         // Use English locale
          enable_publishing: false,  // Disable publishing features
          allow_symbol_change: true, // Allow changing the symbol
          save_image: false,         // Disable saving image feature
          container_id: "tradingview_widget",  // ID of the container div
          studies: [
            { 
              id: "Compare@tv-basicstudies", 
              inputs: { 
                symbol: "${compareSymbol}",
                source: "close"
              },
              options: {
                "priceScale": "new-left",
                "scaleMargins": {
                  "top": 0.3,
                  "bottom": 0.3
                }
              }
            }
          ],
          overrides: {
            "scalesProperties.backgroundColor": "#ffffff",
            "scalesProperties.lineColor": "#F0F3FA",
            "scalesProperties.textColor": "#131722",
            "scalesProperties.scaleSeriesOnly": false,
            "mainSeriesProperties.priceAxisProperties.autoScale": true,
            "mainSeriesProperties.priceAxisProperties.percentage": false,
            "mainSeriesProperties.priceAxisProperties.log": false,
            "compareToMainSeriesSource": "close",
            "mainSeriesSymbolAllowsComparison": true,
            "comparisons.0.color": "#FF0000",
            "comparisons.0.width": 2,
            "comparisons.0.style": 0,  // 0 for solid line
            "comparisons.0.isVisible": true,
            "comparisons.0.showInDataWindow": true,
            "comparisons.0.showInLegend": true,
            "comparisons.0.showInSymbolList": true,
            "comparisons.0.comparisonMode": "price",  // Use "price" for absolute values
          },
          customFeed: {
            subscribeRealtime(callback) {
              console.log('Subscription to realtime updates is not available.');
              return function() {};
            },
            unsubscribeRealtime(subscriberId) {
              console.log('Unsubscribe from realtime updates is not available.');
            }
          }
        });

        // Error handling for WebSocket connections
        window.addEventListener('error', function(event) {
          if (event.message.includes('WebSocket connection')) {
            console.log('WebSocket connection failed. This may affect real-time data updates.');
          }
        });
      `;

      // Create the HTML content for the iframe
      const html = `
        <html>
          <head>
            <!-- Load the TradingView library -->
            <script src="https://s3.tradingview.com/tv.js"></script>
          </head>
          <body>
            <!-- Container for the TradingView widget -->
            <div id="tradingview_widget"></div>
            <!-- Inline script to set up the widget -->
            <script>${script}</script>
          </body>
        </html>
      `;

      // Set the HTML content of the iframe
      iframe.srcdoc = html;
    }
  }, [symbol, width, height]);  // Re-run this effect if symbol, width, or height changes

  // Render an iframe that will contain the TradingView chart
  return (
    <>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <iframe
        ref={containerRef}  // Attach the ref to the iframe
        style={{ width, height, border: 'none' }}  // Set the iframe dimensions and remove border
        title="TradingView Advanced Chart"  // Set a title for accessibility
      />
    </>
  );
};

// Export the component as the default export
export default AdvancedCharts;