# TradingView Advanced Chart React TypeScript Project

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

This project implements a TradingView Advanced Chart using React and TypeScript. It provides a customizable financial chart component that can be easily integrated into React applications, offering a powerful tool for displaying and analyzing financial market data.

## Features

- Real-time stock data visualization
- Multiple chart types (e.g., Short Interest, MACD, RSI, OBV)
- Customizable time intervals
- Dark and light theme options
- Responsive design for various screen sizes
- Keyboard navigation for chart type switching

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14.x or later recommended)
- npm (version 6.x or later) or yarn (version 1.22.x or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/tradingview-advanced-chart-react.git
   cd tradingview-advanced-chart-react
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or if you're using yarn:
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or with yarn:
   ```
   yarn start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

The main component of this project is `TradingViewWidget`. You can use it in your React components like this:

```jsx
import TradingViewWidget from './components/TradingViewWidget';

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <TradingViewWidget symbol="NASDAQ:AAPL" interval="D" theme="dark" />
    </div>
  );
}
```

### Props

The `TradingViewWidget` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `symbol` | string | 'NASDAQ:NVDA' | The stock symbol to display |
| `interval` | string | 'D' | The time interval for the chart (e.g., 'D' for daily, 'W' for weekly) |
| `theme` | 'light' \| 'dark' | 'dark' | The color theme of the widget |

## Available Scripts

In the project directory, you can run:

- `npm start` or `yarn start`: Runs the app in development mode
- `npm test` or `yarn test`: Launches the test runner in interactive watch mode
- `npm run build` or `yarn build`: Builds the app for production to the `build` folder
- `npm run eject` or `yarn eject`: Ejects the app from Create React App configuration (note: this is a one-way operation)

## Project Structure

```
tradingview-advanced-chart-react/
├── src/
│   ├── components/
│   │   └── TradingViewWidget.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Customization

### Adding New Chart Types

To add a new chart type:

1. Update the `ChartType` enum in `TradingViewWidget.tsx`
2. Add a new case in the `createWidgetConfig` function
3. Implement the necessary studies and compare symbols for the new chart type

### Styling

The project uses a combination of CSS and Tailwind utility classes. To customize styles:

- Modify `src/App.css` for global styles
- Use Tailwind classes directly in component JSX for component-specific styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License (GPL) v3.0. See the [LICENSE](LICENSE) file for more information.

### Why GPL v3?

The GPL v3 license enforces strong copyleft requirements and ensures that all derivative works of this project remain open source. This license also provides additional protections against patent claims, which aligns with the goal to keep contributions and derivatives freely available and to safeguard the project's integrity and freedom.

## Acknowledgments

- [TradingView](https://www.tradingview.com/) for providing the charting library
- [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) for the core technologies
- All contributors who have helped to improve this project

---

For more information about React, check out the [React documentation](https://reactjs.org/).

For more details about TradingView widgets, visit the [TradingView Widgets documentation](https://www.tradingview.com/widget/).