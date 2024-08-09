# TradingView Advanced Chart React TypeScript Project

This project implements a TradingView Advanced Chart using React and TypeScript. It provides a customizable financial chart component that can be easily integrated into React applications.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 12.x or later)
- npm (usually comes with Node.js)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/tradingview-advanced-chart-react.git
   cd tradingview-advanced-chart-react
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

The main component of this project is `TradingViewWidget`. You can use it in your React components like this:

```jsx
import TradingViewWidget from './TradingViewWidget';

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <TradingViewWidget symbol="NASDAQ:AAPL" interval="D" theme="dark" />
    </div>
  );
}
```

### Props

- `symbol` (optional): The stock symbol to display (default: 'NASDAQ:NVDA')
- `interval` (optional): The time interval for the chart (default: 'D' for daily)
- `theme` (optional): The color theme, either 'light' or 'dark' (default: 'dark')

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Learn More

To learn more about React, check out the [React documentation](https://reactjs.org/).

For more information about TradingView widgets, visit the [TradingView Widgets documentation](https://www.tradingview.com/widget/).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU General Public License (GPL) v3.0. See the [LICENSE](LICENSE) file for more information.

### Why GPL v3?

The GPL v3 license enforces strong copyleft requirements and ensures that all derivative works of this project remain open source. This license also provides additional protections against patent claims, which aligns with the goal to keep contributions and derivatives freely available and to safeguard the project's integrity and freedom.