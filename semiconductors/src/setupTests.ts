/**
 * @file setupTests.ts
 * @description Configuration file for setting up the Jest testing environment
 */

// Import Jest DOM extensions for additional DOM-related assertions
import '@testing-library/jest-dom';

// Import the fetch polyfill to enable fetch in the test environment
import 'whatwg-fetch';

/**
 * Mock the TradingView object that would normally be loaded via a script tag
 * This allows us to test components that depend on the TradingView widget without actually loading it
 */
Object.defineProperty(window, 'TradingView', {
  value: {
    widget: jest.fn().mockImplementation(() => ({
      // Add any methods or properties of the TradingView widget that your tests might use
      onChartReady: jest.fn(),
      setSymbol: jest.fn(),
      // ... other methods as needed
    })),
  },
  writable: true,
});

/**
 * Mock the ResizeObserver which is not available in the Jest environment
 * This prevents errors when testing components that might use ResizeObserver
 */
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

/**
 * Set up global beforeEach and afterEach hooks for all tests
 * This can be useful for resetting mocks or cleaning up after each test
 */
beforeEach(() => {
  // Reset all mocks before each test
  jest.resetAllMocks();
});

afterEach(() => {
  // Clean up any global state or side effects after each test
});