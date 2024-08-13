/**
 * @file App.test.tsx
 * @description Test suite for the App component
 */

// Import necessary testing utilities and the component to be tested
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Test suite for the App component
 */
describe('App Component', () => {
  /**
   * Test case: Check if App renders without crashing
   */
  test('renders without crashing', () => {
    // Render the App component
    render(<App />);
    
    // If the render doesn't throw an error, the test passes
  });

  /**
   * Test case: Check if TradingViewWidget is rendered within App
   */
  test('renders TradingViewWidget', () => {
    // Render the App component
    render(<App />);
    
    // Check if an element with the id 'tradingview_widget' is in the document
    // This assumes that the TradingViewWidget creates an element with this id
    const widgetElement = document.getElementById('tradingview_widget');
    expect(widgetElement).toBeInTheDocument();
  });

  /**
   * Test case: Check if the container has the correct classes for full-screen display
   */
  test('has full-screen container', () => {
    // Render the App component
    render(<App />);
    
    // Check if there's a div with the classes 'h-screen' and 'w-full'
    const containerElement = screen.getByTestId('app-container');
    expect(containerElement).toHaveClass('h-screen', 'w-full');
  });
});