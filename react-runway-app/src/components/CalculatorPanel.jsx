import { useState } from 'react';
import { useRunway } from '../context/RunwayContext';
import './CalculatorPanel.css';

export const CalculatorPanel = () => {
  const { calcPanelOpen } = useRunway();
  const [formData, setFormData] = useState({
    runwayWidth: '',
    runwayLength: '',
    includeSafety: false
  });
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCalculate = () => {
    const width = parseFloat(formData.runwayWidth);
    const length = parseFloat(formData.runwayLength);

    if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) {
      setResult({ type: 'error', message: 'Please enter valid dimensions' });
      return;
    }

    const area = width * length;
    const tileSize = 1; // 1m x 1m
    const tilesNeeded = Math.ceil(area / (tileSize * tileSize));
    const safetyMargin = formData.includeSafety ? Math.ceil(tilesNeeded * 0.1) : 0;
    const totalTiles = tilesNeeded + safetyMargin;

    setResult({
      type: 'success',
      message: `Estimated tiles needed: ${tilesNeeded} tiles${
        safetyMargin > 0 ? ` + ${safetyMargin} safety margin = ${totalTiles} total` : ''
      }`
    });
  };

  const handleClear = () => {
    setFormData({ runwayWidth: '', runwayLength: '', includeSafety: false });
    setResult(null);
  };

  return (
    <div className={`calc-panel ${calcPanelOpen ? 'active' : ''}`}>
      <div className="calc-content">
        <h3>Runway Calculator</h3>
        <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="runwayWidth">Runway Width (m)</label>
            <input
              type="number"
              id="runwayWidth"
              name="runwayWidth"
              value={formData.runwayWidth}
              onChange={handleInputChange}
              placeholder="Enter width"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="runwayLength">Runway Length (m)</label>
            <input
              type="number"
              id="runwayLength"
              name="runwayLength"
              value={formData.runwayLength}
              onChange={handleInputChange}
              placeholder="Enter length"
              step="0.1"
            />
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="includeSafety"
              checked={formData.includeSafety}
              onChange={handleInputChange}
            />
            <span>Include 10% safety margin</span>
          </label>
          <div className="calc-buttons">
            <button type="button" className="btn-primary" onClick={handleCalculate}>
              Calculate
            </button>
            <button type="button" className="btn-secondary" onClick={handleClear}>
              Clear
            </button>
          </div>
          {result && (
            <div className={`calc-result ${result.type}`}>
              {result.message}
            </div>
          )}
        </form>
        <div className="draw-instructions">
          <p><strong>💡 How to use:</strong></p>
          <p>• Drag tiles from the left palette to the grid</p>
          <p>• Right-click tiles to rotate them</p>
          <p>• Use zoom controls to adjust view</p>
          <p>• Export your design as an image</p>
        </div>
      </div>
    </div>
  );
};
