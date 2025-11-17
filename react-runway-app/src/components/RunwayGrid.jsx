import { useRef, useState } from 'react';
import { useRunway } from '../context/RunwayContext';
import './RunwayGrid.css';

export const RunwayGrid = () => {
  const { tiles, viewBox, addTile, updateTile, zoomIn, zoomOut, resetZoom, clearGrid } = useRunway();
  const svgRef = useRef(null);
  const [draggingTile, setDraggingTile] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const tileStartPos = useRef({ x: 0, y: 0 });

  console.log('RunwayGrid - tiles:', tiles, 'count:', tiles.length);

  const getSVGPoint = (e) => {
    const svgElement = svgRef.current;
    if (!svgElement) return { x: 0, y: 0 };
    
    const rect = svgElement.getBoundingClientRect();
    const pt = svgElement.createSVGPoint();
    pt.x = e.clientX - rect.left;
    pt.y = e.clientY - rect.top;
    const svgP = pt.matrixTransform(svgElement.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggingTile) {
      // Don't process drop if we're dragging an existing tile
      return;
    }
    
    // Check if it's a new tile from palette
    const tileData = e.dataTransfer.getData('tile');

    if (tileData) {
      const tile = JSON.parse(tileData);
      const { x, y } = getSVGPoint(e);
      
      // Snap to grid (50cm intervals)
      const gridSize = 50;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;

      console.log('Adding new tile:', tile);
      const newTile = {
        ...tile,
        x: snappedX,
        y: snappedY,
        rotation: 0
      };
      addTile(newTile);
    }
  };

  const handleTileMouseDown = (e, tileId) => {
    e.stopPropagation();
    e.preventDefault();
    
    const tile = tiles.find(t => t.id === tileId);
    if (!tile) return;

    const svgPos = getSVGPoint(e);
    dragStartPos.current = svgPos;
    tileStartPos.current = { x: tile.x, y: tile.y };
    setDraggingTile(tileId);
  };

  const handleMouseMove = (e) => {
    if (!draggingTile) return;
    e.preventDefault();

    const svgPos = getSVGPoint(e);
    const dx = svgPos.x - dragStartPos.current.x;
    const dy = svgPos.y - dragStartPos.current.y;

    const newX = tileStartPos.current.x + dx;
    const newY = tileStartPos.current.y + dy;

    const gridSize = 50;
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;

    updateTile(draggingTile, { x: snappedX, y: snappedY });
  };

  const handleMouseUp = (e) => {
    if (draggingTile) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDraggingTile(null);
  };

  const handleTileRightClick = (e, tileId) => {
    e.preventDefault();
    e.stopPropagation();
    const tile = tiles.find(t => t.id === tileId);
    if (tile) {
      const newRotation = (tile.rotation + 90) % 360;
      updateTile(tileId, { rotation: newRotation });
    }
  };

  const handleExportImage = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 2400;
    canvas.height = 2400;

    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = 'runway-grid.png';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    img.src = url;
  };

  const renderTile = (tile) => {
    const { id, x, y, width, height, rotation, title } = tile;
    
    let shape;
    if (title === 'Tile 1m × 1m') {
      shape = (
        <rect x={0} y={0} width={width} height={height} fill="#4a90e2" stroke="#2c3e50" strokeWidth="2" />
      );
    } else if (title === 'Tile 1m × 0.5m') {
      shape = (
        <rect x={0} y={0} width={width} height={height} fill="#5a6c7d" stroke="#2c3e50" strokeWidth="2" />
      );
    } else if (title === 'Ramp 1m') {
      shape = (
        <rect x={0} y={0} width={width} height={height} fill="#e8a87c" stroke="#2c3e50" strokeWidth="2" />
      );
    } else if (title === 'Ramp 0.5m') {
      shape = (
        <rect x={0} y={0} width={width} height={height} fill="#e8a87c" stroke="#2c3e50" strokeWidth="2" />
      );
    } else if (title === 'Ramp Corner') {
      shape = (
        <g>
          <rect x={0} y={0} width={25} height={25} fill="#ffd700" stroke="#2c3e50" strokeWidth="2" />
          <rect x={25} y={0} width={25} height={25} fill="#ffd700" stroke="#2c3e50" strokeWidth="2" />
          <rect x={0} y={25} width={25} height={25} fill="#ffd700" stroke="#2c3e50" strokeWidth="2" />
        </g>
      );
    } else if (title === 'Ramp Cut Right') {
      shape = (
        <path d={`M 0 0 L ${width} 0 L ${width * 0.7} ${height} L 0 ${height} Z`} fill="#90ee90" stroke="#2c3e50" strokeWidth="2" />
      );
    } else if (title === 'Ramp Cut Left') {
      shape = (
        <path d={`M 0 0 L ${width} 0 L ${width} ${height} L ${width * 0.3} ${height} Z`} fill="#90ee90" stroke="#2c3e50" strokeWidth="2" />
      );
    }

    return (
      <g
        key={id}
        className="dropped-tile"
        transform={`translate(${x}, ${y}) rotate(${rotation}, ${width / 2}, ${height / 2})`}
        onContextMenu={(e) => handleTileRightClick(e, id)}
        onMouseDown={(e) => handleTileMouseDown(e, id)}
      >
        {shape}
        {/* Transparent overlay to make entire tile interactive */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          stroke="none"
          style={{ cursor: draggingTile === id ? 'grabbing' : 'grab' }}
        />
      </g>
    );
  };

  return (
    <div className="container">
      <div className="svg-wrapper">
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={zoomIn} title="Zoom In">+</button>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out">−</button>
          <button className="zoom-btn" onClick={resetZoom} title="Reset Zoom">⊙</button>
          <button className="zoom-btn" onClick={handleExportImage} title="Export as Image">📷</button>
          <button className="zoom-btn" onClick={clearGrid} title="Clear Grid">✕</button>
        </div>
        <svg
          ref={svgRef}
          id="runway-svg"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: draggingTile ? 'grabbing' : 'default' }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ddd" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#grid)" />
          <g id="runway-group" transform="translate(600, 600) scale(0.1, -0.1)">
            <rect x="-1000" y="-500" width="2000" height="1000" fill="transparent" stroke="none" />
            <text x="0" y="-450" textAnchor="middle" fontSize="60" fontWeight="bold" fill="#2c3e50" transform="scale(1, -1)">3D Deltas precut tiles</text>
            <line x1="204.738" y1="359.122" x2="300.001" y2="304.122" stroke="#2c3e50" strokeWidth="2" />
            <line x1="182.908" y1="331.311" x2="197.908" y2="357.292" stroke="#2c3e50" strokeWidth="2" />
            <line x1="160.971" y1="338.204" x2="176.078" y2="329.481" stroke="#2c3e50" strokeWidth="2" />
            <line x1="101.286" y1="338.800" x2="0.500" y2="338.800" stroke="#2c3e50" strokeWidth="2" />
            <line x1="0.500" y1="500.000" x2="0.500" y2="338.800" stroke="#2c3e50" strokeWidth="2" />
            <line x1="0.500" y1="500.000" x2="1000.000" y2="500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="1000.000" y1="500.000" x2="1000.000" y2="-500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="0.500" y1="-500.000" x2="1000.000" y2="-500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="0.500" y1="-338.800" x2="0.500" y2="-500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="0.500" y1="-338.800" x2="101.286" y2="-338.800" stroke="#2c3e50" strokeWidth="2" />
            <line x1="160.845" y1="-338.266" x2="161.098" y2="-338.130" stroke="#2c3e50" strokeWidth="2" />
            <line x1="161.098" y1="-338.130" x2="596.000" y2="-87.039" stroke="#2c3e50" strokeWidth="2" />
            <line x1="596.000" y1="-87.039" x2="596.000" y2="-34.062" stroke="#2c3e50" strokeWidth="2" />
            <line x1="596.000" y1="87.039" x2="596.000" y2="34.062" stroke="#2c3e50" strokeWidth="2" />
            <line x1="288.661" y1="264.481" x2="596.000" y2="87.039" stroke="#2c3e50" strokeWidth="2" />
            <line x1="301.831" y1="297.292" x2="286.831" y2="271.311" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-204.738" y1="359.122" x2="-300.001" y2="304.122" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-301.831" y1="297.292" x2="-286.831" y2="271.311" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-288.661" y1="264.481" x2="-596.000" y2="87.039" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-596.000" y1="87.039" x2="-596.000" y2="34.062" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-596.000" y1="-87.039" x2="-596.000" y2="-34.062" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-596.000" y1="-87.039" x2="-160.971" y2="-338.204" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-101.286" y1="-338.800" x2="-0.500" y2="-338.800" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-0.500" y1="-338.800" x2="-0.500" y2="-500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-1000.000" y1="-500.000" x2="-0.500" y2="-500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-1000.000" y1="500.000" x2="-1000.000" y2="-500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-0.500" y1="500.000" x2="-1000.000" y2="500.000" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-0.500" y1="500.000" x2="-0.500" y2="338.800" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-101.286" y1="338.800" x2="-0.500" y2="338.800" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-160.971" y1="338.204" x2="-176.078" y2="329.481" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-182.908" y1="331.311" x2="-197.908" y2="357.292" stroke="#2c3e50" strokeWidth="2" />
            <line x1="-197.908" y1="357.292" x2="-204.738" y2="359.122" stroke="#2c3e50" strokeWidth="2" />
          </g>
          {tiles.map(tile => renderTile(tile))}
        </svg>
        <div className="grid-instruction">
          Right-click on tiles to rotate them
        </div>
      </div>
    </div>
  );
};
