import { useState } from 'react';
import { useRunway } from '../context/RunwayContext';
import './TopToolbar.css';

export const TopToolbar = () => {
  const { setCalcPanelOpen, savePreset, loadPreset } = useRunway();
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);

  const handleSavePreset = () => {
    savePreset();
    setPresetMenuOpen(false);
    alert('Preset saved successfully!');
  };

  const handleLoadPreset = () => {
    const loaded = loadPreset();
    setPresetMenuOpen(false);
    if (loaded) {
      alert('Preset loaded successfully!');
    } else {
      alert('No saved preset found.');
    }
  };

  return (
    <div className="top-toolbar">
      <div className="toolbar-logo">
        <img src="/logo.png" alt="Kinvent Logo" />
      </div>
      <div className="toolbar-title">
        <h1>Runway Calculation Tool</h1>
        <span className="version-badge">v1.3</span>
      </div>
      <div className="toolbar-calculator">
        <div className="preset-dropdown">
          <button 
            className="preset-toggle-btn"
            onClick={() => setPresetMenuOpen(!presetMenuOpen)}
          >
            Presets
          </button>
          {presetMenuOpen && (
            <div className="preset-menu active">
              <button 
                className="preset-item" 
                data-action="save"
                onClick={handleSavePreset}
              >
                💾 Save Current Layout
              </button>
              <button 
                className="preset-item" 
                data-action="load"
                onClick={handleLoadPreset}
              >
                📂 Load Saved Layout
              </button>
            </div>
          )}
        </div>
        <button 
          className="calc-toggle-btn"
          onClick={() => setCalcPanelOpen(prev => !prev)}
        >
          🧮 Calculator
        </button>
      </div>
    </div>
  );
};
