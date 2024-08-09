/**
 * @file TradingViewWidget.tsx
 * @description A React component that renders a TradingView Advanced Chart widget.
 * This component uses the TradingView external embedding script to display
 * a fully-featured chart with customizable settings.
 */
import React, { useEffect, useRef, useState } from 'react';

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
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current) {
        try {
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
            container_id: container.current.id,
          });
          setLoading(false);
        } catch (err) {
          setError("Failed to initialize TradingView widget");
          setLoading(false);
        }
      }
    };
    script.onerror = () => {
      setError("Failed to load TradingView library");
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
      document.head.removeChild(script);
    };
  }, [symbol, interval, theme]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {loading && <div>Loading TradingView widget...</div>}
      <div id="tradingview_widget" ref={container} style={{ height: "calc(100% - 32px)", width: "100%" }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default TradingViewWidget;