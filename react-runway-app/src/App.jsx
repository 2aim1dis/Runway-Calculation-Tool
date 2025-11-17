import { RunwayProvider } from './context/RunwayContext';
import { TopToolbar } from './components/TopToolbar';
import { TilePalette } from './components/TilePalette';
import { RunwayGrid } from './components/RunwayGrid';
import { InventoryPanel } from './components/InventoryPanel';
import { CalculatorPanel } from './components/CalculatorPanel';
import { BottomToolbar } from './components/BottomToolbar';
import './App.css';

function App() {
  return (
    <RunwayProvider>
      <div className="app">
        <TopToolbar />
        <CalculatorPanel />
        <div className="main-container">
          <TilePalette />
          <RunwayGrid />
          <InventoryPanel />
        </div>
        <BottomToolbar />
      </div>
    </RunwayProvider>
  );
}

export default App;
