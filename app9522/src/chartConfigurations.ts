/**
 * @file chartConfigurations.ts
 * @description Defines the configurations for different chart types used in the TradingView widget.
 */

import { ChartType } from './types'; // Assuming we have a types.ts file defining ChartType enum

/**
 * Interface for compare symbol configuration
 * @interface CompareSymbol
 */
export interface CompareSymbol {
  /** The symbol to compare or a function to generate it */
  symbol: string | ((sym: string) => string);
  /** Optional title for the compare symbol */
  title?: string;
  /** Position on the chart (e.g., 'NewPriceScale' for a new price scale) */
  position: string;
}

/**
 * Interface for study configuration
 * @interface Study
 */
export interface Study {
  /** The identifier of the study */
  id: string;
  /** Optional name for the study */
  name?: string;
  /** Whether to force the study as an overlay */
  forceOverlay?: boolean;
}

/**
 * Interface for chart configuration
 * @interface ChartConfig
 */
export interface ChartConfig {
  /** Array of compare symbols for the chart */
  compareSymbols: CompareSymbol[];
  /** Array of studies to be applied to the chart */
  studies: (string | Study)[];
}

/**
 * Configurations for each chart type.
 * Each property is a ChartType, and its value is a ChartConfig object.
 * 
 * @type {Record<ChartType, ChartConfig>}
 */
export const chartConfigs: Record<ChartType, ChartConfig> = {
  // Configuration for Short Interest chart
  [ChartType.ShortInterest]: {
    compareSymbols: [{
      // Function to generate the short volume symbol based on the input symbol
      symbol: (sym: string) => `FINRA:${sym.split(':').pop() || sym}_SHORT_VOLUME`,
      title: "Short Volume",
      position: "NewPane"
    }],
    studies: ["STD;Visible%1Average%1Price"] // Moving Average study
  },

  // Configuration for MACD (Moving Average Convergence Divergence) chart
  [ChartType.MACD]: {
    compareSymbols: [{
      symbol: "CME_MINI:NQ1!", // Nasdaq 100 futures
      position: "NewPriceScale"
    }],
    studies: ["MACD@tv-basicstudies"] // MACD study
  },

  // Configuration for RSI (Relative Strength Index) chart
  [ChartType.RSI]: {
    compareSymbols: [{
      symbol: "CME_MINI:ES1!", // S&P 500 futures
      position: "NewPriceScale"
    }],
    studies: ["RSI@tv-basicstudies"] // RSI study
  },

  // Configuration for OBV (On-Balance Volume) chart
  [ChartType.OBV]: {
    compareSymbols: [], // No compare symbols
    studies: ["OBV@tv-basicstudies"] // OBV study
  },

  // Configuration for AD (Accumulation/Distribution) chart
  [ChartType.AD]: {
    compareSymbols: [], // No compare symbols
    studies: ["ACCD@tv-basicstudies"] // Accumulation/Distribution study
  },

  // Configuration for Linear Regression chart
  [ChartType.LinearRegression]: {
    compareSymbols: [], // No compare symbols
    studies: [
      "LinearRegression@tv-basicstudies", // Linear Regression study
      "MF@tv-basicstudies" // Money Flow Index study
    ]
  },

  // Configuration for ATR (Average True Range) chart
  [ChartType.ATR]: {
    compareSymbols: [], // No compare symbols
    studies: ["ATR@tv-basicstudies"] // Average True Range study
  },

  // Configuration for Slow Stochastic chart
  [ChartType.SlowStoch]: {
    compareSymbols: [], // No compare symbols
    studies: ["Stochastic@tv-basicstudies"] // Slow Stochastic study
  }
};

/**
 * Retrieves the configuration for a specific chart type.
 * 
 * @param {ChartType} type - The type of chart to get the configuration for.
 * @param {string} symbol - The symbol for which to get the configuration.
 * @returns {ChartConfig} The configuration for the specified chart type.
 */
export function getChartConfig(type: ChartType, symbol: string): ChartConfig {
  // Get the base configuration for the chart type
  const config = chartConfigs[type];
  
  // Process compare symbols, resolving any symbol functions
  const compareSymbols = config.compareSymbols.map(cs => ({
    ...cs,
    symbol: typeof cs.symbol === 'function' ? cs.symbol(symbol) : cs.symbol
  }));

  // Return the processed configuration
  return {
    ...config,
    compareSymbols
  };
}