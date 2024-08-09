import React from 'react';
import TradingViewWidget from './TradingViewWidget';
import './App.css';

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <TradingViewWidget symbol="NASDAQ:NVDA" interval="D" theme="dark" />
    </div>
  );
}

export default App;