/**
 * @file reportWebVitals.ts
 * @description This file contains functions to measure and report various web vitals metrics.
 * Web Vitals are a set of useful metrics that aim to capture the user experience of a web page.
 */

// Import the ReportHandler type from the 'web-vitals' package
import { ReportHandler, Metric } from 'web-vitals';

/**
 * Custom type for the web vitals metric names
 */
type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';

/**
 * Function to log the metrics to the console in a formatted way
 * @param {Metric} metric - The web vital metric object
 */
const logMetric = (metric: Metric): void => {
  // Destructure the metric object to get relevant properties
  const { name, value, id } = metric;
  
  // Log the metric in a formatted way
  console.log(`${name} (ID: ${id}): ${value}`);
};

/**
 * The main function to report web vitals
 * @param {ReportHandler} [onPerfEntry] - Optional callback function to handle the metrics
 */
const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  // Check if onPerfEntry is provided and is a function
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals library
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Core Web Vitals
      getCLS(onPerfEntry);  // Cumulative Layout Shift
      getLCP(onPerfEntry);  // Largest Contentful Paint
      getFID(onPerfEntry);  // First Input Delay
      
      // Other Web Vitals
      getFCP(onPerfEntry);  // First Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
      
      // Log each metric to the console
      getCLS(logMetric);
      getLCP(logMetric);
      getFID(logMetric);
      getFCP(logMetric);
      getTTFB(logMetric);
    });
  } else {
    console.warn('reportWebVitals was called without a valid callback function');
  }
};

/**
 * Function to send metrics to an analytics endpoint
 * @param {Metric} metric - The web vital metric object
 */
const sendToAnalytics = (metric: Metric): void => {
  // Destructure the metric object
  const { name, delta, id } = metric;
  
  // Construct the body of the analytics request
  const body = JSON.stringify({ name, delta, id });
  
  // Use the Beacon API to send the data to your analytics endpoint
  // Replace 'https://example.com/analytics' with your actual endpoint
  const url = 'https://example.com/analytics';
  
  // The Beacon API is used here as it's designed for sending analytics data
  // It's non-blocking and works well even if the page is being unloaded
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    // Fallback to fetch for browsers that don't support sendBeacon
    fetch(url, { body, method: 'POST', keepalive: true });
  }
};

// Export the reportWebVitals function as the default export
export default reportWebVitals;

// Also export the sendToAnalytics function for use in other parts of the application
export { sendToAnalytics };