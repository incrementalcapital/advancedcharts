import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:NVDA",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "8",
        "locale": "en",
        "backgroundColor": "rgba(0, 0, 0, 1)",
        "gridColor": "rgba(0, 0, 0, 1)",
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "watchlist": [
          "NASDAQ:NVDA"
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
    container.current?.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
