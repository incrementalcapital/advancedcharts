/**
 * @fileoverview This file contains the AdvancedCharts component, which renders a TradingView chart
 * with a comparison to the short volume data for the given symbol on a new left scale.
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * @interface AdvancedChartsProps
 * @description Defines the props required by the AdvancedCharts component.
 */
interface AdvancedChartsProps {
  /** The symbol to display in the chart. */
  symbol: string;
  /** The width of the chart. */
  width: string | number;
  /** The height of the chart. */
  height: string | number;
}

/**
 * @component AdvancedCharts
 * @description The AdvancedCharts component renders an advanced chart using the TradingView library.
 * @param {AdvancedChartsProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ symbol, width, height }) => {
  /**
   * @description A reference to the container div where the TradingView chart will be rendered.
   * useRef is used to persist this reference across component re-renders.
   */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * @function loadTradingViewScript
   * @description Loads the TradingView script dynamically if it's not already loaded.
   * @returns {Promise<void>} A promise that resolves when the script is loaded.
   */
  const loadTradingViewScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Check if the TradingView script is already loaded
      if (window.TradingView) {
        resolve(); // Resolve immediately if the script is already loaded
      } else {
        const script = document.createElement('script'); // Create a new script element
        script.src = 'https://s3.tradingview.com/tv.js'; // Set the source to TradingView's script
        script.async = true; // Load the script asynchronously
        script.onload = () => resolve(); // Resolve the promise when the script loads successfully
        script.onerror = () => reject(new Error('TradingView script failed to load')); // Reject if there's an error
        document.body.appendChild(script); // Append the script to the document body
      }
    });
  };

  /**
   * @function renderChart
   * @description Renders the TradingView chart using the widget API.
   * This function is called after the script has been successfully loaded.
   * @async
   */
  const renderChart = async () => {
    try {
      // Load the TradingView script if it's not already loaded
      await loadTradingViewScript();

      // Check if the container element is available and the TradingView object is loaded
      if (containerRef.current && window.TradingView) {
        // Initialize the TradingView widget with the provided options
        new window.TradingView.widget({
          symbol: symbol, // The symbol to display
          interval: "D", // Daily interval
          width: width, // Width of the chart
          height: height, // Height of the chart
          timezone: "Etc/UTC", // Timezone setting
          theme: "light", // Light theme
          style: "1", // Chart style
          locale: "en", // Locale setting to English
          enable_publishing: false, // Disable the ability to publish the chart
          allow_symbol_change: true, // Allow the user to change the symbol
          save_image: false, // Disable the ability to save the chart as an image
          container_id: containerRef.current.id, // Use the ref's ID as the container ID
          studies: [
            {
              id: "Compare@tv-basicstudies", // Add a comparison study
              inputs: {
                symbol: `FINRA:${symbol.split(':').pop()}_SHORT_VOLUME`, // Compare with the generated symbol
              },
              properties: {
                'Plot.color.0': '#2196F3', // Customize the color of the study line
                'Plot.scale.0': 'Left', // Place the volume study on the left scale
                'Plot.type': 'Line', // Ensure the volume is displayed as a line (can also be histogram)
              },
            },
          ],
          overrides: {
            'mainSeriesProperties.priceLine.color': '#FF0000', // Customize the price line color if needed
            'paneProperties.leftAxisProperties.autoScale': true, // Enable auto-scaling for the left axis (volume)
            'paneProperties.rightAxisProperties.autoScale': true, // Enable auto-scaling for the right axis (price)
          },
        });
      }
    } catch (error) {
      // Log any errors that occur during the rendering process
      console.error('Error rendering chart:', error);
    }
  };

  /**
   * @description useEffect hook to load the TradingView script and render the chart.
   * This effect runs once when the component mounts and whenever the symbol, width, or height changes.
   */
  useEffect(() => {
    renderChart(); // Call the renderChart function to render the chart
  }, [symbol, width, height]); // Re-run the effect if symbol, width, or height changes

  // Render the container div for the TradingView chart
  return <div ref={containerRef} id={`tradingview_widget_${symbol.replace(':', '_')}`} style={{ width, height }} />;
};

export default AdvancedCharts;
