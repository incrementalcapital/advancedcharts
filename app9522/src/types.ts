/**
 * @file types.ts
 * @description Defines common types and enums used across the TradingView widget components.
 */

/**
 * Enum for different chart types
 * Each value represents a different chart configuration with specific indicators
 * @enum {string}
 */
export enum ChartType {
    ShortInterest = 'Short Interest', // Shows short volume data alongside the main chart
    MACD = 'MACD', // Moving Average Convergence Divergence
    RSI = 'RSI', // Relative Strength Index
    AD = 'AD', // Accumulation/Distribution
    LinearRegression = 'Linear Regression', // New chart type
    OBV = 'OBV', // On-Balance Volume
    ATR = 'ATR', // Average True Range
    SlowStoch = 'Slow Stochastic' // Slow Stochastic Oscillator
  }