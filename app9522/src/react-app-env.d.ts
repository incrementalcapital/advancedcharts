/**
 * @file react-app-env.d.ts
 * @description TypeScript declarations for Create React App and custom project types
 */

/// <reference types="react-scripts" />

/**
 * Declare the global TradingView object
 * This allows TypeScript to recognize the TradingView object that's loaded via script tag
 */
interface Window {
    TradingView: {
      widget: (config: any) => any;
    }
  }
  
  /**
   * Declare module for SVG imports
   * This allows TypeScript to recognize SVG imports as React components
   */
  declare module "*.svg" {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
  }
  
  /**
   * Declare module for CSS/SCSS modules
   * This allows TypeScript to recognize CSS/SCSS imports as objects
   */
  declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
  }
  
  declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
  }