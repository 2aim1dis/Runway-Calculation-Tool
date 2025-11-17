/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

const RunwayContext = createContext();

export const RunwayProvider = ({ children }) => {
  const [tiles, setTiles] = useState([]);
  const [inventory, setInventory] = useState({});
  const [zoom, setZoom] = useState(1);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 1200 });
  const [calcPanelOpen, setCalcPanelOpen] = useState(false);

  const updateInventory = useCallback((type, delta) => {
    setInventory(prev => {
      const nextValue = (prev[type] || 0) + delta;
      if (nextValue <= 0) {
        const { [type]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [type]: nextValue
      };
    });
  }, []);

  const addTile = useCallback((tile) => {
    const newTile = { ...tile, id: Date.now() + Math.random() };
    setTiles(prev => [...prev, newTile]);
    updateInventory(tile.title, 1);
  }, [updateInventory]);

  const removeTile = useCallback((tileId) => {
    setTiles(prev => {
      const tile = prev.find(t => t.id === tileId);
      if (tile) {
        updateInventory(tile.title, -1);
      }
      return prev.filter(t => t.id !== tileId);
    });
  }, [updateInventory]);

  const updateTile = useCallback((tileId, updates) => {
    setTiles(prev => prev.map(t => t.id === tileId ? { ...t, ...updates } : t));
  }, []);

  const clearGrid = useCallback(() => {
    setTiles([]);
    setInventory({});
  }, []);

  const zoomIn = useCallback(() => {
    const newZoom = zoom * 1.2;
    const originalViewBox = { x: 0, y: 0, width: 1200, height: 1200 };
    
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;
    const newWidth = originalViewBox.width / newZoom;
    const newHeight = originalViewBox.height / newZoom;
    
    setZoom(newZoom);
    setViewBox({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    });
  }, [zoom, viewBox]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, 1);
    const originalViewBox = { x: 0, y: 0, width: 1200, height: 1200 };
    
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;
    const newWidth = originalViewBox.width / newZoom;
    const newHeight = originalViewBox.height / newZoom;
    
    setZoom(newZoom);
    setViewBox({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    });
  }, [zoom, viewBox]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setViewBox({ x: 0, y: 0, width: 1200, height: 1200 });
  }, []);

  const savePreset = useCallback(() => {
    const preset = {
      tiles: tiles,
      inventory: inventory,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('runwayPreset', JSON.stringify(preset));
    return true;
  }, [tiles, inventory]);

  const loadPreset = useCallback(() => {
    const saved = localStorage.getItem('runwayPreset');
    if (saved) {
      const preset = JSON.parse(saved);
      setTiles(preset.tiles || []);
      setInventory(preset.inventory || {});
      return true;
    }
    return false;
  }, []);

  const value = {
    tiles,
    inventory,
    zoom,
    viewBox,
    calcPanelOpen,
    setCalcPanelOpen,
    addTile,
    removeTile,
    updateTile,
    clearGrid,
    zoomIn,
    zoomOut,
    resetZoom,
    savePreset,
    loadPreset
  };

  return (
    <RunwayContext.Provider value={value}>
      {children}
    </RunwayContext.Provider>
  );
};

export const useRunway = () => {
  const context = useContext(RunwayContext);
  if (!context) {
    throw new Error('useRunway must be used within a RunwayProvider');
  }
  return context;
};
