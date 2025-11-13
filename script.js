// Runway Calculation App
console.log('Runway visualization loaded successfully!');

// Add interactivity when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    // Hover effect for runway shape
    const runwayGroup = document.getElementById('runway-group');
    const dimensions = document.getElementById('dimensions');
    
    if (runwayGroup && dimensions) {
        runwayGroup.addEventListener('mouseenter', () => {
            dimensions.style.opacity = '1';
        });

        runwayGroup.addEventListener('mouseleave', () => {
            dimensions.style.opacity = '0';
        });
    }
    
    // Zoom and Pan functionality
    const svg = document.getElementById('runway-svg');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    
    let currentZoom = 1;
    let viewBox = { x: 0, y: 0, width: 1200, height: 1200 };
    const originalViewBox = { ...viewBox };
    
    function updateViewBox() {
        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    }
    
    // Zoom buttons
    zoomInBtn.addEventListener('click', () => {
        currentZoom *= 1.2;
        const centerX = viewBox.x + viewBox.width / 2;
        const centerY = viewBox.y + viewBox.height / 2;
        viewBox.width = originalViewBox.width / currentZoom;
        viewBox.height = originalViewBox.height / currentZoom;
        viewBox.x = centerX - viewBox.width / 2;
        viewBox.y = centerY - viewBox.height / 2;
        updateViewBox();
    });
    
    zoomOutBtn.addEventListener('click', () => {
        currentZoom /= 1.2;
        if (currentZoom < 1) currentZoom = 1;
        const centerX = viewBox.x + viewBox.width / 2;
        const centerY = viewBox.y + viewBox.height / 2;
        viewBox.width = originalViewBox.width / currentZoom;
        viewBox.height = originalViewBox.height / currentZoom;
        viewBox.x = centerX - viewBox.width / 2;
        viewBox.y = centerY - viewBox.height / 2;
        updateViewBox();
    });
    
    zoomResetBtn.addEventListener('click', () => {
        currentZoom = 1;
        viewBox = { ...originalViewBox };
        updateViewBox();
    });
    
    // Clear grid button
    const clearGridBtn = document.getElementById('clear-grid');
    clearGridBtn.addEventListener('click', () => {
        // Remove all dropped tiles
        const droppedTiles = svg.querySelectorAll('.dropped-tile');
        droppedTiles.forEach(tile => tile.remove());
        
        // Clear inventory (keep only the runway)
        Object.keys(inventory).forEach(key => delete inventory[key]);
        updateInventory();
    });
    
    // Square Meter Calculator functionality
    const calcToggleBtn = document.getElementById('calc-toggle-btn');
    const calcPanel = document.getElementById('calc-panel');
    const calcCloseBtn = document.getElementById('calc-close-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const squareMetersInput = document.getElementById('square-meters');
    const useRampsCheckbox = document.getElementById('use-ramps');
    const calcResult = document.getElementById('calc-result');
    
    calcToggleBtn.addEventListener('click', () => {
        calcPanel.classList.toggle('active');
        if (calcPanel.classList.contains('active')) {
            // Close drawing panel if open
            const drawPanel = document.getElementById('draw-panel');
            if (drawPanel) {
                drawPanel.classList.remove('active');
            }
        }
    });
    
    calcCloseBtn.addEventListener('click', () => {
        calcPanel.classList.remove('active');
    });
    
    calculateBtn.addEventListener('click', () => {
        const targetSquareMeters = parseFloat(squareMetersInput.value);
        const useRamps = useRampsCheckbox.checked;
        
        if (!targetSquareMeters || targetSquareMeters <= 0) {
            showCalcResult('Please enter a valid square meter value.', 'error');
            return;
        }
        
        // Convert to cm² (1 m² = 10,000 cm²)
        const targetArea = targetSquareMeters * 10000;
        
        // Calculate and place tiles
        const result = calculateTilePlacement(targetArea, useRamps);
        
        if (result.success) {
            showCalcResult(
                `Successfully placed ${result.tilesPlaced} tiles covering ${result.areaCovered.toFixed(2)} m²`,
                'success'
            );
            calcPanel.classList.remove('active');
        } else {
            showCalcResult(result.message, 'error');
        }
    });
    
    function showCalcResult(message, type) {
        calcResult.textContent = message;
        calcResult.className = `calc-result ${type}`;
    }
    
    // Drawing Tool functionality
    const drawToggleBtn = document.getElementById('draw-toggle-btn');
    const drawPanel = document.getElementById('draw-panel');
    const drawCloseBtn = document.getElementById('draw-close-btn');
    const startDrawingBtn = document.getElementById('start-drawing-btn');
    const cancelDrawingBtn = document.getElementById('cancel-drawing-btn');
    const fillShapeBtn = document.getElementById('fill-shape-btn');
    const drawUseRampsCheckbox = document.getElementById('draw-use-ramps');
    const drawResult = document.getElementById('draw-result');
    
    let isDrawing = false;
    let isFreeDrawing = false;
    let drawPoints = [];
    let drawPolygon = null;
    let drawPointMarkers = [];
    
    drawToggleBtn.addEventListener('click', () => {
        drawPanel.classList.toggle('active');
        if (drawPanel.classList.contains('active')) {
            calcPanel.classList.remove('active'); // Close calculator panel
        }
    });
    
    drawCloseBtn.addEventListener('click', () => {
        drawPanel.classList.remove('active');
        cancelDrawing();
    });
    
    startDrawingBtn.addEventListener('click', () => {
        startDrawing();
    });
    
    cancelDrawingBtn.addEventListener('click', () => {
        cancelDrawing();
    });
    
    fillShapeBtn.addEventListener('click', () => {
        fillDrawnShape();
    });
    
    function startDrawing() {
        isDrawing = true;
        isFreeDrawing = false;
        drawPoints = [];
        drawPointMarkers = [];
        
        startDrawingBtn.style.display = 'none';
        cancelDrawingBtn.style.display = 'block';
        fillShapeBtn.style.display = 'none';
        
        showDrawResult('Click and drag to draw. Release to finish the shape.', 'info');
        
        // Change cursor to crosshair
        svg.style.cursor = 'crosshair';
    }
    
    function cancelDrawing() {
        isDrawing = false;
        drawPoints = [];
        
        // Remove polygon and markers
        if (drawPolygon) {
            drawPolygon.remove();
            drawPolygon = null;
        }
        drawPointMarkers.forEach(marker => marker.remove());
        drawPointMarkers = [];
        
        startDrawingBtn.style.display = 'block';
        cancelDrawingBtn.style.display = 'none';
        fillShapeBtn.style.display = 'none';
        
        svg.style.cursor = 'grab';
        drawResult.style.display = 'none';
    }
    
    function showDrawResult(message, type) {
        drawResult.textContent = message;
        drawResult.className = `calc-result ${type}`;
    }
    
    // Handle mouse events for free drawing on SVG
    svg.addEventListener('mousedown', (e) => {
        if (!isDrawing || isFreeDrawing) return;
        
        // Prevent default dragging behavior
        e.preventDefault();
        
        isFreeDrawing = true;
        drawPoints = [];
        drawPointMarkers = [];
        
        // Get starting point
        const svgRect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        const x = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
        const y = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
        
        // Snap to 50cm grid
        const snappedX = Math.round(x / 50) * 50;
        const snappedY = Math.round(y / 50) * 50;
        
        drawPoints.push({ x: snappedX, y: snappedY });
        
        showDrawResult('Keep dragging to draw your shape...', 'info');
    });
    
    svg.addEventListener('mousemove', (e) => {
        if (!isFreeDrawing) return;
        
        // Get current point
        const svgRect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        const x = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
        const y = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
        
        // Snap to 50cm grid
        const snappedX = Math.round(x / 50) * 50;
        const snappedY = Math.round(y / 50) * 50;
        
        // Only add point if it's different from the last one (avoid duplicates)
        const lastPoint = drawPoints[drawPoints.length - 1];
        if (!lastPoint || lastPoint.x !== snappedX || lastPoint.y !== snappedY) {
            drawPoints.push({ x: snappedX, y: snappedY });
            updateDrawPolygon();
        }
    });
    
    svg.addEventListener('mouseup', (e) => {
        if (!isFreeDrawing) return;
        
        isFreeDrawing = false;
        
        // Automatically close the shape by connecting to first point
        if (drawPoints.length >= 3) {
            closeShape();
        } else {
            showDrawResult('Shape too small. Please draw a larger area.', 'error');
            cancelDrawing();
        }
    });
    
    function updateDrawPolygon() {
        if (drawPoints.length < 2) return;
        
        // Remove existing polygon
        if (drawPolygon) {
            drawPolygon.remove();
        }
        
        // Create new polyline (not closed yet while drawing)
        const points = drawPoints.map(p => `${p.x},${p.y}`).join(' ');
        
        if (isFreeDrawing) {
            // Show as polyline while drawing
            drawPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            drawPolygon.setAttribute('points', points);
            drawPolygon.setAttribute('fill', 'none');
            drawPolygon.setAttribute('stroke', '#4a90e2');
            drawPolygon.setAttribute('stroke-width', '3');
            drawPolygon.setAttribute('class', 'draw-polygon');
        } else {
            // Show as closed polygon
            drawPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            drawPolygon.setAttribute('points', points);
            drawPolygon.setAttribute('fill', '#4a90e2');
            drawPolygon.setAttribute('fill-opacity', '0.2');
            drawPolygon.setAttribute('stroke', '#4a90e2');
            drawPolygon.setAttribute('stroke-width', '3');
            drawPolygon.setAttribute('stroke-dasharray', '10,5');
            drawPolygon.setAttribute('class', 'draw-polygon');
        }
        
        svg.appendChild(drawPolygon);
    }
    
    function closeShape() {
        if (drawPoints.length < 3) {
            showDrawResult('Need at least 3 points to create a shape!', 'error');
            return;
        }
        
        isDrawing = false;
        isFreeDrawing = false;
        
        // Remove the polyline and create closed polygon
        if (drawPolygon) {
            drawPolygon.remove();
        }
        
        // Create closed polygon connecting last point to first point
        const points = drawPoints.map(p => `${p.x},${p.y}`).join(' ');
        drawPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        drawPolygon.setAttribute('points', points);
        drawPolygon.setAttribute('fill', '#4a90e2');
        drawPolygon.setAttribute('fill-opacity', '0.3');
        drawPolygon.setAttribute('stroke', '#4a90e2');
        drawPolygon.setAttribute('stroke-width', '3');
        drawPolygon.setAttribute('class', 'draw-polygon');
        svg.appendChild(drawPolygon);
        
        cancelDrawingBtn.style.display = 'none';
        fillShapeBtn.style.display = 'block';
        
        svg.style.cursor = 'grab';
        showDrawResult(`Shape closed with ${drawPoints.length} points. Click "Fill Shape with Tiles" to continue.`, 'success');
    }
    
    function fillDrawnShape() {
        const useRamps = drawUseRampsCheckbox.checked;
        
        // Remove the drawing polygon and markers
        if (drawPolygon) {
            drawPolygon.remove();
            drawPolygon = null;
        }
        drawPointMarkers.forEach(marker => marker.remove());
        drawPointMarkers = [];
        
        // Fill the shape with tiles
        const result = fillPolygonWithTiles(drawPoints, useRamps);
        
        if (result.success) {
            showDrawResult(
                `Successfully filled shape with ${result.tilesPlaced} tiles covering ${result.areaCovered.toFixed(2)} m²`,
                'success'
            );
            
            // Reset drawing state
            drawPoints = [];
            fillShapeBtn.style.display = 'none';
            startDrawingBtn.style.display = 'block';
            
            // Close panel after short delay
            setTimeout(() => {
                drawPanel.classList.remove('active');
            }, 2000);
        } else {
            showDrawResult(result.message || 'Error filling shape', 'error');
        }
    }
    
    /**
     * Fill a custom polygon with tiles
     */
    function fillPolygonWithTiles(polygonPoints, useRamps) {
        if (!polygonPoints || polygonPoints.length < 3) {
            return { success: false, message: 'Invalid polygon' };
        }
        
        // Calculate bounding box
        const minX = Math.min(...polygonPoints.map(p => p.x));
        const maxX = Math.max(...polygonPoints.map(p => p.x));
        const minY = Math.min(...polygonPoints.map(p => p.y));
        const maxY = Math.max(...polygonPoints.map(p => p.y));
        
        let tilesPlaced = 0;
        let currentArea = 0;
        const tileArea = 5000; // 0.5 m²
        const rampArea = 2500; // 0.25 m²
        
        // First, fill interior with regular tiles
        for (let y = minY; y <= maxY; y += 50) {
            for (let x = minX; x <= maxX; x += 50) {
                // Try horizontal tile first
                let tileWidth = 100;
                let tileHeight = 50;
                
                // Check if tile center is inside polygon
                const centerX = x + tileWidth / 2;
                const centerY = y + tileHeight / 2;
                
                if (!isPointInPolygon(centerX, centerY, polygonPoints)) {
                    // Try vertical orientation
                    tileWidth = 50;
                    tileHeight = 100;
                    const centerX2 = x + tileWidth / 2;
                    const centerY2 = y + tileHeight / 2;
                    
                    if (!isPointInPolygon(centerX2, centerY2, polygonPoints)) {
                        continue;
                    }
                }
                
                // Check for overlaps
                if (overlapsWithRunway(x, y, tileWidth, tileHeight) || 
                    overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                    continue;
                }
                
                // Determine if this tile is on the perimeter
                const isPerimeter = useRamps && isTileOnPerimeter(x, y, tileWidth, tileHeight, polygonPoints);
                
                if (isPerimeter && tileHeight === 50) {
                    // Use ramp on perimeter (horizontal tiles only)
                    const rampTile = createRampTile(x, y, 'Ramp 1m');
                    rampTile.setAttribute('height', '25');
                    if (rampTile) {
                        svg.appendChild(rampTile);
                        tilesPlaced++;
                        currentArea += rampArea;
                        
                        if (!inventory['Ramp 1m']) {
                            inventory['Ramp 1m'] = 0;
                        }
                        inventory['Ramp 1m']++;
                    }
                } else {
                    // Use regular tile
                    const tile = createTile(x, y, tileWidth, tileHeight, 'Tile 1m × 0.5m');
                    if (tile) {
                        svg.appendChild(tile);
                        tilesPlaced++;
                        currentArea += tileArea;
                        
                        if (!inventory['Tile 1m × 0.5m']) {
                            inventory['Tile 1m × 0.5m'] = 0;
                        }
                        inventory['Tile 1m × 0.5m']++;
                    }
                }
            }
        }
        
        updateInventory();
        
        return {
            success: true,
            tilesPlaced: tilesPlaced,
            areaCovered: currentArea / 10000
        };
    }
    
    /**
     * Check if a point is inside a polygon using ray-casting algorithm
     */
    function isPointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    /**
     * Check if a tile is on the perimeter of the polygon
     */
    function isTileOnPerimeter(x, y, width, height, polygon) {
        // Check if any corner or edge is near the polygon boundary
        const corners = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height }
        ];
        
        // Check if any adjacent cell (50cm away) is outside polygon
        const adjacentCells = [
            { x: x - 50, y: y },      // Left
            { x: x + width, y: y },   // Right
            { x: x, y: y - 50 },      // Top
            { x: x, y: y + height }   // Bottom
        ];
        
        for (const cell of adjacentCells) {
            if (!isPointInPolygon(cell.x + 25, cell.y + 25, polygon)) {
                return true; // Adjacent to exterior
            }
        }
        
        return false;
    }
    
    /**
     * Calculate and automatically place tiles around the runway
     */
    function calculateTilePlacement(targetArea, useRamps) {
        // Clear existing tiles first
        const droppedTiles = svg.querySelectorAll('.dropped-tile');
        droppedTiles.forEach(tile => tile.remove());
        Object.keys(inventory).forEach(key => delete inventory[key]);
        
        // Runway bounds (in SVG coordinates)
        const runwayBounds = {
            x: 500,
            y: 550,
            width: 200,
            height: 100
        };
        
        // Define buffer zones around the runway where we'll place tiles
        const buffer = 50; // Start placing tiles 50cm from runway edge
        
        // Tile size: 1m × 0.5m = 100cm × 50cm = 5000 cm²
        const tileArea = 5000;
        const rampArea = 2500; // Ramp: 1m × 0.25m = 2500 cm²
        let currentArea = 0;
        let tilesPlaced = 0;
        
        // Strategy: Place tiles in concentric rectangles around the runway
        let layer = 0;
        const maxLayers = 20; // Prevent infinite loop
        let totalLayers = 0;
        
        // First pass: count how many layers we'll need
        let tempArea = 0;
        let tempLayer = 0;
        while (tempArea < targetArea && tempLayer < maxLayers) {
            const layerOffset = buffer + (tempLayer * 50);
            const layerBounds = {
                x: runwayBounds.x - layerOffset,
                y: runwayBounds.y - layerOffset,
                width: runwayBounds.width + (layerOffset * 2),
                height: runwayBounds.height + (layerOffset * 2)
            };
            
            // Rough estimate of tiles per layer
            const tilesInLayer = Math.floor((layerBounds.width * 2 + layerBounds.height * 2) / 50);
            tempArea += tilesInLayer * tileArea;
            tempLayer++;
        }
        totalLayers = tempLayer;
        
        // Second pass: actually place tiles
        while (currentArea < targetArea && layer < maxLayers) {
            const layerOffset = buffer + (layer * 50);
            
            // Define the current layer boundary around runway
            const layerBounds = {
                x: runwayBounds.x - layerOffset,
                y: runwayBounds.y - layerOffset,
                width: runwayBounds.width + (layerOffset * 2),
                height: runwayBounds.height + (layerOffset * 2)
            };
            
            // Determine if this is the outermost layer and we're using ramps
            const isOutermostLayer = (layer === totalLayers - 1 || layer >= totalLayers - 2);
            const useRampsOnThisLayer = useRamps && isOutermostLayer;
            
            // Place tiles on TOP edge of current layer
            for (let x = layerBounds.x; x < layerBounds.x + layerBounds.width && currentArea < targetArea; x += 100) {
                const y = layerBounds.y;
                
                if (useRampsOnThisLayer) {
                    // Use ramp on outermost layer
                    const tileWidth = 100;
                    const tileHeight = 25;
                    
                    if (!overlapsWithRunway(x, y, tileWidth, tileHeight) && 
                        !overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                        
                        const rampTile = createRampTile(x, y, 'Ramp 1m');
                        if (rampTile) {
                            svg.appendChild(rampTile);
                            tilesPlaced++;
                            currentArea += rampArea;
                            
                            if (!inventory['Ramp 1m']) {
                                inventory['Ramp 1m'] = 0;
                            }
                            inventory['Ramp 1m']++;
                        }
                    }
                } else {
                    // Use regular tile
                    const tileWidth = 100;
                    const tileHeight = 50;
                    
                    if (!overlapsWithRunway(x, y, tileWidth, tileHeight) && 
                        !overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                        
                        const tile = createTile(x, y, tileWidth, tileHeight, 'Tile 1m × 0.5m');
                        if (tile) {
                            svg.appendChild(tile);
                            tilesPlaced++;
                            currentArea += tileArea;
                            
                            if (!inventory['Tile 1m × 0.5m']) {
                                inventory['Tile 1m × 0.5m'] = 0;
                            }
                            inventory['Tile 1m × 0.5m']++;
                        }
                    }
                }
            }
            
            // Place tiles on BOTTOM edge of current layer
            for (let x = layerBounds.x; x < layerBounds.x + layerBounds.width && currentArea < targetArea; x += 100) {
                let y, tileHeight;
                
                if (useRampsOnThisLayer) {
                    y = layerBounds.y + layerBounds.height - 25;
                    tileHeight = 25;
                } else {
                    y = layerBounds.y + layerBounds.height - 50;
                    tileHeight = 50;
                }
                
                if (useRampsOnThisLayer) {
                    // Use ramp on outermost layer
                    const tileWidth = 100;
                    
                    if (!overlapsWithRunway(x, y, tileWidth, tileHeight) && 
                        !overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                        
                        const rampTile = createRampTile(x, y, 'Ramp 1m');
                        if (rampTile) {
                            svg.appendChild(rampTile);
                            tilesPlaced++;
                            currentArea += rampArea;
                            
                            if (!inventory['Ramp 1m']) {
                                inventory['Ramp 1m'] = 0;
                            }
                            inventory['Ramp 1m']++;
                        }
                    }
                } else {
                    // Use regular tile
                    const tileWidth = 100;
                    
                    if (!overlapsWithRunway(x, y, tileWidth, tileHeight) && 
                        !overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                        
                        const tile = createTile(x, y, tileWidth, tileHeight, 'Tile 1m × 0.5m');
                        if (tile) {
                            svg.appendChild(tile);
                            tilesPlaced++;
                            currentArea += tileArea;
                            
                            if (!inventory['Tile 1m × 0.5m']) {
                                inventory['Tile 1m × 0.5m'] = 0;
                            }
                            inventory['Tile 1m × 0.5m']++;
                        }
                    }
                }
            }
            
            // Place tiles on LEFT edge of current layer (vertical orientation)
            const leftStartY = layerBounds.y + 50;
            const leftEndY = layerBounds.y + layerBounds.height - 50;
            
            for (let y = leftStartY; y < leftEndY && currentArea < targetArea; y += 100) {
                const x = layerBounds.x;
                const tileWidth = 50;
                const tileHeight = 100;
                
                if (!overlapsWithRunway(x, y, tileWidth, tileHeight) && 
                    !overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                    
                    const tile = createTile(x, y, tileWidth, tileHeight, 'Tile 1m × 0.5m');
                    if (tile) {
                        svg.appendChild(tile);
                        tilesPlaced++;
                        currentArea += tileArea;
                        
                        if (!inventory['Tile 1m × 0.5m']) {
                            inventory['Tile 1m × 0.5m'] = 0;
                        }
                        inventory['Tile 1m × 0.5m']++;
                    }
                }
            }
            
            // Place tiles on RIGHT edge of current layer (vertical orientation)
            const rightStartY = layerBounds.y + 50;
            const rightEndY = layerBounds.y + layerBounds.height - 50;
            
            for (let y = rightStartY; y < rightEndY && currentArea < targetArea; y += 100) {
                const x = layerBounds.x + layerBounds.width - 50;
                const tileWidth = 50;
                const tileHeight = 100;
                
                if (!overlapsWithRunway(x, y, tileWidth, tileHeight) && 
                    !overlapsWithExistingTiles(x, y, tileWidth, tileHeight)) {
                    
                    const tile = createTile(x, y, tileWidth, tileHeight, 'Tile 1m × 0.5m');
                    if (tile) {
                        svg.appendChild(tile);
                        tilesPlaced++;
                        currentArea += tileArea;
                        
                        if (!inventory['Tile 1m × 0.5m']) {
                            inventory['Tile 1m × 0.5m'] = 0;
                        }
                        inventory['Tile 1m × 0.5m']++;
                    }
                }
            }
            
            // Add corner ramps if using ramps and on outermost layer
            if (useRampsOnThisLayer && currentArea < targetArea) {
                const corners = [
                    { x: layerBounds.x, y: layerBounds.y }, // Top-left
                    { x: layerBounds.x + layerBounds.width - 50, y: layerBounds.y }, // Top-right
                    { x: layerBounds.x, y: layerBounds.y + layerBounds.height - 50 }, // Bottom-left
                    { x: layerBounds.x + layerBounds.width - 50, y: layerBounds.y + layerBounds.height - 50 } // Bottom-right
                ];
                
                for (const corner of corners) {
                    if (currentArea >= targetArea) break;
                    
                    // Try to place a corner ramp (50x50 L-shape)
                    if (!overlapsWithRunway(corner.x, corner.y, 50, 50) && 
                        !overlapsWithExistingTiles(corner.x, corner.y, 50, 50)) {
                        
                        const cornerRamp = createCornerRamp(corner.x, corner.y);
                        if (cornerRamp) {
                            svg.appendChild(cornerRamp);
                            tilesPlaced++;
                            currentArea += 1875; // Corner ramp approximate area
                            
                            if (!inventory['Ramp Corner']) {
                                inventory['Ramp Corner'] = 0;
                            }
                            inventory['Ramp Corner']++;
                        }
                    }
                }
            }
            
            layer++;
        }
        
        updateInventory();
        
        return {
            success: true,
            tilesPlaced: tilesPlaced,
            areaCovered: currentArea / 10000 // Convert back to m²
        };
    }
    
    /**
     * Create a tile element
     */
    function createTile(x, y, width, height, tileName) {
        const tile = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tile.setAttribute('x', x);
        tile.setAttribute('y', y);
        tile.setAttribute('width', width);
        tile.setAttribute('height', height);
        
        // Color based on size
        let fillColor = '#5a6c7d';
        if (width === 100 && height === 100) {
            fillColor = '#4a90e2';
        } else if (height === 25) {
            fillColor = '#e8a87c';
        }
        
        tile.setAttribute('fill', fillColor);
        tile.setAttribute('fill-opacity', '0.7');
        tile.setAttribute('stroke', '#2c3e50');
        tile.setAttribute('stroke-width', '2');
        tile.setAttribute('class', 'dropped-tile');
        tile.style.cursor = 'move';
        tile.setAttribute('data-tile-name', tileName);
        
        makeTileDraggable(tile);
        
        return tile;
    }
    
    /**
     * Find optimal positions for ramps around the layout
     */
    function findRampPositions(runwayBounds) {
        const positions = [];
        
        // Add ramps at strategic positions around the edges
        // Top edge
        positions.push({ x: runwayBounds.x - 100, y: runwayBounds.y - 25, type: 'Ramp 1m' });
        positions.push({ x: runwayBounds.x + runwayBounds.width, y: runwayBounds.y - 25, type: 'Ramp 1m' });
        
        // Bottom edge
        positions.push({ x: runwayBounds.x - 100, y: runwayBounds.y + runwayBounds.height, type: 'Ramp 1m' });
        positions.push({ x: runwayBounds.x + runwayBounds.width, y: runwayBounds.y + runwayBounds.height, type: 'Ramp 1m' });
        
        return positions;
    }
    
    /**
     * Create a ramp tile
     */
    function createRampTile(x, y, rampType) {
        const tile = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tile.setAttribute('x', x);
        tile.setAttribute('y', y);
        tile.setAttribute('width', 100);
        tile.setAttribute('height', 25);
        tile.setAttribute('fill', '#e8a87c');
        tile.setAttribute('fill-opacity', '0.7');
        tile.setAttribute('stroke', '#2c3e50');
        tile.setAttribute('stroke-width', '2');
        tile.setAttribute('class', 'dropped-tile');
        tile.style.cursor = 'move';
        tile.setAttribute('data-tile-name', rampType);
        
        makeTileDraggable(tile);
        
        return tile;
    }
    
    /**
     * Create a corner ramp tile (L-shaped)
     */
    function createCornerRamp(x, y) {
        const tile = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = `${x},${y} ${x + 50},${y} ${x + 50},${y + 25} ${x + 25},${y + 25} ${x + 25},${y + 50} ${x},${y + 50}`;
        tile.setAttribute('points', points);
        tile.setAttribute('fill', '#ffd700');
        tile.setAttribute('fill-opacity', '0.7');
        tile.setAttribute('stroke', '#2c3e50');
        tile.setAttribute('stroke-width', '2');
        tile.setAttribute('class', 'dropped-tile');
        tile.style.cursor = 'move';
        tile.setAttribute('data-tile-name', 'Ramp Corner');
        tile.setAttribute('data-corner-x', x);
        tile.setAttribute('data-corner-y', y);
        tile.setAttribute('data-shape-type', 'corner');
        
        makeTileDraggable(tile);
        
        return tile;
    }
    
    // Mouse wheel zoom
    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        currentZoom *= delta;
        if (currentZoom < 1) currentZoom = 1;
        
        const svgRect = svg.getBoundingClientRect();
        const mouseX = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
        const mouseY = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
        
        viewBox.width = originalViewBox.width / currentZoom;
        viewBox.height = originalViewBox.height / currentZoom;
        viewBox.x = mouseX - (e.clientX - svgRect.left) / svgRect.width * viewBox.width;
        viewBox.y = mouseY - (e.clientY - svgRect.top) / svgRect.height * viewBox.height;
        
        updateViewBox();
    });
    
    // Pan functionality
    let isPanning = false;
    let startPoint = { x: 0, y: 0 };
    
    svg.addEventListener('mousedown', (e) => {
        // Disable panning when in drawing mode
        if (isDrawing) return;
        
        if (e.target === svg || e.target.tagName === 'rect' && e.target.getAttribute('fill') === 'url(#grid)') {
            isPanning = true;
            startPoint = { x: e.clientX, y: e.clientY };
            svg.style.cursor = 'grabbing';
        }
    });
    
    svg.addEventListener('mousemove', (e) => {
        if (isPanning) {
            const dx = (startPoint.x - e.clientX) * (viewBox.width / svg.getBoundingClientRect().width);
            const dy = (startPoint.y - e.clientY) * (viewBox.height / svg.getBoundingClientRect().height);
            viewBox.x += dx;
            viewBox.y += dy;
            startPoint = { x: e.clientX, y: e.clientY };
            updateViewBox();
        }
    });
    
    svg.addEventListener('mouseup', () => {
        isPanning = false;
        if (!isDrawing) {
            svg.style.cursor = 'grab';
        }
    });
    
    svg.addEventListener('mouseleave', () => {
        isPanning = false;
        if (!isDrawing) {
            svg.style.cursor = 'grab';
        }
    });
    
    // Drag and Drop functionality
    const paletteTiles = document.querySelectorAll('.palette-tile');
    let draggedTileData = null;
    
    // Inventory tracking system - stores count of each tile type placed on grid
    const inventory = {};
    
    // Price mapping for each tile type (in euros) - Default prices from Runway Items.csv
    const tilePrices = {
        'Tile 1m × 1m': 61.20,
        'Tile 1m × 0.5m': 32.00,
        'Ramp 1m': 26.00,
        'Ramp 0.5m': 14.00,
        'Ramp Corner': 52.00,
        'Ramp Cut Right': 28.00,
        'Ramp Cut Left': 28.00,
        '3D Deltas precut tiles': 160.00  // Sum of Cut tile Left (80) + Cut tile Right (80)
    };
    
    /**
     * Updates the inventory table to reflect current tiles on grid
     * Always shows the runway (3D Deltas) and any dropped tiles with counts and prices
     */
    function updateInventory() {
        const inventoryBody = document.getElementById('inventory-body');
        inventoryBody.innerHTML = '';
        
        let totalCount = 0;
        let totalPrice = 0;
        
        // Always show the runway (permanent fixture)
        const runwayPrice = tilePrices['3D Deltas precut tiles'] || 0;
        const runwayRow = document.createElement('tr');
        runwayRow.innerHTML = `
            <td>3D Deltas precut tiles</td>
            <td class="count-cell">1</td>
            <td class="price-cell">€${runwayPrice.toFixed(2)}</td>
        `;
        inventoryBody.appendChild(runwayRow);
        
        // Add to totals
        totalCount += 1;
        totalPrice += runwayPrice;
        
        // Add dropped tiles dynamically with pricing
        Object.keys(inventory).forEach(key => {
            if (inventory[key] > 0) {
                const count = inventory[key];
                const unitPrice = tilePrices[key] || 0;
                const itemTotalPrice = count * unitPrice;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${key}</td>
                    <td class="count-cell">${count}</td>
                    <td class="price-cell">€${itemTotalPrice.toFixed(2)}</td>
                `;
                inventoryBody.appendChild(row);
                
                // Add to totals
                totalCount += count;
                totalPrice += itemTotalPrice;
            }
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td class="count-cell"><strong>${totalCount}</strong></td>
            <td class="price-cell"><strong>€${totalPrice.toFixed(2)}</strong></td>
        `;
        inventoryBody.appendChild(totalRow);
    }
    
    // Handle drag start from palette
    paletteTiles.forEach(tile => {
        tile.addEventListener('dragstart', (e) => {
            draggedTileData = {
                width: parseInt(tile.dataset.width),
                height: parseInt(tile.dataset.height),
                title: tile.dataset.tileTitle || `${tile.dataset.width}cm × ${tile.dataset.height}cm`,
                isCorner: tile.dataset.tileTitle === 'Ramp Corner',
                cutType: tile.dataset.cutType || null
            };
            e.dataTransfer.effectAllowed = 'copy';
        });
    });
    
    // Handle drop on SVG
    svg.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    /**
     * Check if a rectangle overlaps with the runway
     * Runway is at position 600,600 with scale 0.1, actual size -1000,-500 to 1000,500
     * After transformation: x: 600-100=500 to 600+100=700, y: 600-50=550 to 600+50=650
     */
    function overlapsWithRunway(x, y, width, height) {
        const runwayX = 500;
        const runwayY = 550;
        const runwayWidth = 200;
        const runwayHeight = 100;
        
        return !(x + width <= runwayX || 
                 x >= runwayX + runwayWidth ||
                 y + height <= runwayY ||
                 y >= runwayY + runwayHeight);
    }
    
    /**
     * Check if a tile overlaps with any existing dropped tiles
     */
    function overlapsWithExistingTiles(newX, newY, newWidth, newHeight, excludeTile = null) {
        const droppedTiles = svg.querySelectorAll('.dropped-tile');
        
        for (let tile of droppedTiles) {
            if (tile === excludeTile) continue; // Skip the tile being moved
            
            let tileX, tileY, tileWidth, tileHeight;
            
            if (tile.tagName === 'polygon') {
                // For polygons, get bounding box
                const bbox = tile.getBBox();
                tileX = bbox.x;
                tileY = bbox.y;
                tileWidth = bbox.width;
                tileHeight = bbox.height;
            } else {
                // For rectangles
                tileX = parseFloat(tile.getAttribute('x'));
                tileY = parseFloat(tile.getAttribute('y'));
                tileWidth = parseFloat(tile.getAttribute('width'));
                tileHeight = parseFloat(tile.getAttribute('height'));
            }
            
            // Check for overlap
            if (!(newX + newWidth <= tileX || 
                  newX >= tileX + tileWidth ||
                  newY + newHeight <= tileY ||
                  newY >= tileY + tileHeight)) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    /**
     * Get bounding box for a tile based on its type and position
     */
    function getTileBoundingBox(x, y, tileData) {
        if (tileData.isCorner) {
            // L-shape corner: 50x50 with bottom-right missing
            return { x, y, width: 50, height: 50 };
        } else if (tileData.cutType) {
            // Angled ramp: 100x25
            return { x, y, width: 100, height: 25 };
        } else {
            // Regular rectangle
            return { x, y, width: tileData.width, height: tileData.height };
        }
    }
    
    svg.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedTileData) return;
        
        // Get SVG coordinates
        const svgRect = svg.getBoundingClientRect();
        const svgX = e.clientX - svgRect.left;
        const svgY = e.clientY - svgRect.top;
        
        // Convert to SVG viewBox coordinates
        const viewBox = svg.viewBox.baseVal;
        const x = (svgX / svgRect.width) * viewBox.width + viewBox.x;
        const y = (svgY / svgRect.height) * viewBox.height + viewBox.y;
        
        // Snap to grid - use 25cm for corner pieces, 50cm for regular tiles
        const snapSize = draggedTileData.isCorner ? 25 : 50;
        const snappedX = Math.round(x / snapSize) * snapSize;
        const snappedY = Math.round(y / snapSize) * snapSize;
        
        // Check for collisions
        const bbox = getTileBoundingBox(snappedX, snappedY, draggedTileData);
        
        if (overlapsWithRunway(bbox.x, bbox.y, bbox.width, bbox.height)) {
            console.log('Cannot place tile: overlaps with runway');
            draggedTileData = null;
            return;
        }
        
        if (overlapsWithExistingTiles(bbox.x, bbox.y, bbox.width, bbox.height)) {
            console.log('Cannot place tile: overlaps with existing tile');
            draggedTileData = null;
            return;
        }
        
        // Create new tile on grid - use polygon for corner and angled cuts, rect for others
        let newTile;
        
        if (draggedTileData.isCorner) {
            // Create L-shaped polygon for corner ramp (three 25x25 squares: top-left, top-right, bottom-left)
            newTile = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const points = `${snappedX},${snappedY} ${snappedX + 50},${snappedY} ${snappedX + 50},${snappedY + 25} ${snappedX + 25},${snappedY + 25} ${snappedX + 25},${snappedY + 50} ${snappedX},${snappedY + 50}`;
            newTile.setAttribute('points', points);
            newTile.setAttribute('fill', '#ffd700');
            newTile.setAttribute('data-corner-x', snappedX);
            newTile.setAttribute('data-corner-y', snappedY);
            newTile.setAttribute('data-shape-type', 'corner');
        } else if (draggedTileData.cutType) {
            // Create angled ramp with 45-degree cut (100cm x 25cm)
            newTile = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            let points;
            if (draggedTileData.cutType === 'right') {
                // Right cut: angled cut on the right side
                points = `${snappedX},${snappedY} ${snappedX + 100},${snappedY} ${snappedX + 75},${snappedY + 25} ${snappedX},${snappedY + 25}`;
            } else {
                // Left cut: angled cut on the left side
                points = `${snappedX},${snappedY} ${snappedX + 100},${snappedY} ${snappedX + 100},${snappedY + 25} ${snappedX + 25},${snappedY + 25}`;
            }
            newTile.setAttribute('points', points);
            newTile.setAttribute('fill', '#90ee90'); // Light green
            newTile.setAttribute('data-corner-x', snappedX);
            newTile.setAttribute('data-corner-y', snappedY);
            newTile.setAttribute('data-shape-type', draggedTileData.cutType);
            newTile.setAttribute('data-width', draggedTileData.width);
            newTile.setAttribute('data-height', draggedTileData.height);
        } else {
            // Regular rectangle tile
            newTile = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            newTile.setAttribute('x', snappedX);
            newTile.setAttribute('y', snappedY);
            newTile.setAttribute('width', draggedTileData.width);
            newTile.setAttribute('height', draggedTileData.height);
            
            // Set color based on tile type: Blue for 100x100, orange for ramps, grey for other tiles
            let fillColor = '#5a6c7d'; // Default grey
            if (draggedTileData.width === 100 && draggedTileData.height === 100) {
                fillColor = '#4a90e2'; // Blue for square tile
            } else if (draggedTileData.height === 25) {
                fillColor = '#e8a87c'; // Orange for ramps
            }
            newTile.setAttribute('fill', fillColor);
        }
        
        newTile.setAttribute('fill-opacity', '0.7');
        newTile.setAttribute('stroke', '#2c3e50');
        newTile.setAttribute('stroke-width', '2');
        newTile.setAttribute('class', 'dropped-tile');
        newTile.style.cursor = 'move';
        
        // Store tile info as data attribute for inventory tracking using the title from palette
        const tileName = draggedTileData.title;
        newTile.setAttribute('data-tile-name', tileName);
        
        // Update inventory count - increment or initialize
        if (!inventory[tileName]) {
            inventory[tileName] = 0;
        }
        inventory[tileName]++;
        updateInventory(); // Refresh the table display
        
        // Make dropped tiles draggable
        makeTileDraggable(newTile);
        
        svg.appendChild(newTile);
        
        // Reset draggedTileData to prevent double-drop
        draggedTileData = null;
    });
    
    // Function to make tiles draggable within SVG
    function makeTileDraggable(tile) {
        let selectedElement = null;
        let offset = null;
        const isPolygon = tile.tagName === 'polygon';
        
        tile.addEventListener('mousedown', (e) => {
            selectedElement = tile;
            const svgRect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            
            const mouseX = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
            const mouseY = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
            
            if (isPolygon) {
                offset = {
                    x: mouseX - parseFloat(tile.getAttribute('data-corner-x')),
                    y: mouseY - parseFloat(tile.getAttribute('data-corner-y'))
                };
            } else {
                offset = {
                    x: mouseX - parseFloat(tile.getAttribute('x')),
                    y: mouseY - parseFloat(tile.getAttribute('y'))
                };
            }
        });
        
        svg.addEventListener('mousemove', (e) => {
            if (selectedElement) {
                e.preventDefault();
                const svgRect = svg.getBoundingClientRect();
                const viewBox = svg.viewBox.baseVal;
                
                const mouseX = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
                const mouseY = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
                
                // Use 25cm snap for polygons (corners), 50cm for rectangles
                const snapSize = isPolygon ? 25 : 50;
                const newX = Math.round((mouseX - offset.x) / snapSize) * snapSize;
                const newY = Math.round((mouseY - offset.y) / snapSize) * snapSize;
                
                // Get dimensions for collision check
                let checkWidth, checkHeight;
                if (isPolygon) {
                    const bbox = selectedElement.getBBox();
                    checkWidth = bbox.width;
                    checkHeight = bbox.height;
                } else {
                    checkWidth = parseFloat(selectedElement.getAttribute('width'));
                    checkHeight = parseFloat(selectedElement.getAttribute('height'));
                }
                
                // Check for collisions before moving
                if (overlapsWithRunway(newX, newY, checkWidth, checkHeight)) {
                    return; // Don't move if it would overlap with runway
                }
                
                if (overlapsWithExistingTiles(newX, newY, checkWidth, checkHeight, selectedElement)) {
                    return; // Don't move if it would overlap with another tile
                }
                
                if (isPolygon) {
                    // Update polygon points based on shape type
                    const shapeType = selectedElement.getAttribute('data-shape-type');
                    let points;
                    
                    if (shapeType === 'corner') {
                        // L-shape corner
                        points = `${newX},${newY} ${newX + 50},${newY} ${newX + 50},${newY + 25} ${newX + 25},${newY + 25} ${newX + 25},${newY + 50} ${newX},${newY + 50}`;
                    } else if (shapeType === 'right') {
                        // Right cut ramp
                        points = `${newX},${newY} ${newX + 100},${newY} ${newX + 75},${newY + 25} ${newX},${newY + 25}`;
                    } else if (shapeType === 'left') {
                        // Left cut ramp
                        points = `${newX},${newY} ${newX + 100},${newY} ${newX + 100},${newY + 25} ${newX + 25},${newY + 25}`;
                    }
                    
                    selectedElement.setAttribute('points', points);
                    selectedElement.setAttribute('data-corner-x', newX);
                    selectedElement.setAttribute('data-corner-y', newY);
                } else {
                    selectedElement.setAttribute('x', newX);
                    selectedElement.setAttribute('y', newY);
                }
            }
        });
        
        svg.addEventListener('mouseup', () => {
            selectedElement = null;
            offset = null;
        });
        
        // Double click to delete tile and update inventory
        tile.addEventListener('dblclick', () => {
            // Retrieve tile name from data attribute
            const tileName = tile.getAttribute('data-tile-name');
            if (tileName && inventory[tileName]) {
                // Decrement count in inventory
                inventory[tileName]--;
                // Remove from inventory object if count reaches zero
                if (inventory[tileName] <= 0) {
                    delete inventory[tileName];
                }
                updateInventory(); // Refresh the table display
            }
            // Remove tile from SVG
            tile.remove();
        });
        
        // Right click to rotate tile 90 degrees clockwise
        tile.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent browser context menu
            
            if (isPolygon) {
                // Handle polygon rotation
                const shapeType = tile.getAttribute('data-shape-type');
                const currentX = parseFloat(tile.getAttribute('data-corner-x'));
                const currentY = parseFloat(tile.getAttribute('data-corner-y'));
                
                if (shapeType === 'corner') {
                    // Rotate L-shape corner through 4 orientations
                    const currentRotation = parseInt(tile.getAttribute('data-rotation') || '0');
                    const newRotation = (currentRotation + 90) % 360;
                    tile.setAttribute('data-rotation', newRotation);
                    
                    let points;
                    if (newRotation === 0) {
                        // Default: top-left, top-right, bottom-left
                        points = `${currentX},${currentY} ${currentX + 50},${currentY} ${currentX + 50},${currentY + 25} ${currentX + 25},${currentY + 25} ${currentX + 25},${currentY + 50} ${currentX},${currentY + 50}`;
                    } else if (newRotation === 90) {
                        // 90°: top-left, top-right, bottom-right
                        points = `${currentX},${currentY} ${currentX + 50},${currentY} ${currentX + 50},${currentY + 50} ${currentX + 25},${currentY + 50} ${currentX + 25},${currentY + 25} ${currentX},${currentY + 25}`;
                    } else if (newRotation === 180) {
                        // 180°: top-right, bottom-left, bottom-right
                        points = `${currentX + 25},${currentY} ${currentX + 50},${currentY} ${currentX + 50},${currentY + 50} ${currentX},${currentY + 50} ${currentX},${currentY + 25} ${currentX + 25},${currentY + 25}`;
                    } else {
                        // 270°: top-left, bottom-left, bottom-right
                        points = `${currentX},${currentY} ${currentX + 25},${currentY} ${currentX + 25},${currentY + 25} ${currentX + 50},${currentY + 25} ${currentX + 50},${currentY + 50} ${currentX},${currentY + 50}`;
                    }
                    tile.setAttribute('points', points);
                    
                } else if (shapeType === 'right' || shapeType === 'left') {
                    // Rotate angled ramp through 4 orientations
                    const currentRotation = parseInt(tile.getAttribute('data-rotation') || '0');
                    const newRotation = (currentRotation + 90) % 360;
                    tile.setAttribute('data-rotation', newRotation);
                    
                    const width = parseFloat(tile.getAttribute('data-width'));
                    const height = parseFloat(tile.getAttribute('data-height'));
                    let points;
                    
                    if (shapeType === 'right') {
                        if (newRotation === 0) {
                            // Horizontal, cut on right
                            points = `${currentX},${currentY} ${currentX + width},${currentY} ${currentX + width - height},${currentY + height} ${currentX},${currentY + height}`;
                        } else if (newRotation === 90) {
                            // Vertical, cut on bottom
                            points = `${currentX},${currentY} ${currentX + height},${currentY} ${currentX + height},${currentY + width - height} ${currentX},${currentY + width}`;
                        } else if (newRotation === 180) {
                            // Horizontal flipped, cut on left
                            points = `${currentX + height},${currentY} ${currentX + width},${currentY} ${currentX + width},${currentY + height} ${currentX},${currentY + height}`;
                        } else {
                            // Vertical flipped, cut on top
                            points = `${currentX},${currentY + height} ${currentX + height},${currentY} ${currentX + height},${currentY + width} ${currentX},${currentY + width}`;
                        }
                    } else { // left
                        if (newRotation === 0) {
                            // Horizontal, cut on left
                            points = `${currentX},${currentY} ${currentX + width},${currentY} ${currentX + width},${currentY + height} ${currentX + height},${currentY + height}`;
                        } else if (newRotation === 90) {
                            // Vertical, cut on top
                            points = `${currentX},${currentY + height} ${currentX + height},${currentY} ${currentX + height},${currentY + width} ${currentX},${currentY + width}`;
                        } else if (newRotation === 180) {
                            // Horizontal flipped, cut on right
                            points = `${currentX},${currentY} ${currentX + width - height},${currentY} ${currentX + width},${currentY + height} ${currentX},${currentY + height}`;
                        } else {
                            // Vertical flipped, cut on bottom
                            points = `${currentX},${currentY} ${currentX + height},${currentY} ${currentX + height},${currentY + width - height} ${currentX},${currentY + width}`;
                        }
                    }
                    tile.setAttribute('points', points);
                }
                
            } else {
                // Handle rectangle rotation (existing code)
                const currentWidth = parseFloat(tile.getAttribute('width'));
                const currentHeight = parseFloat(tile.getAttribute('height'));
                const currentX = parseFloat(tile.getAttribute('x'));
                const currentY = parseFloat(tile.getAttribute('y'));
                
                // Swap width and height for 90-degree rotation
                tile.setAttribute('width', currentHeight);
                tile.setAttribute('height', currentWidth);
                
                // Adjust position to keep tile centered after rotation
                // Calculate center point before rotation
                const centerX = currentX + currentWidth / 2;
                const centerY = currentY + currentHeight / 2;
                
                // Calculate new top-left position to maintain center
                const newX = centerX - currentHeight / 2;
                const newY = centerY - currentWidth / 2;
                
                // Snap to grid
                tile.setAttribute('x', Math.round(newX / 50) * 50);
                tile.setAttribute('y', Math.round(newY / 50) * 50);
            }
        });
    }
    
    const runwayShape = document.getElementById('runway-shape');
    const clearedArea = document.getElementById('cleared-area');
    
    // Add click handlers for potential future interactions
    if (runwayShape) {
        runwayShape.addEventListener('click', () => {
            console.log('Runway clicked');
        });
    }
    
    if (clearedArea) {
        clearedArea.addEventListener('click', () => {
            console.log('Cleared area clicked');
        });
    }
    
    // Log the actual dimensions from the DXF file
    console.log('Runway dimensions: 2000cm x 1000cm');
    console.log('Cleared area: Octagonal shape in center');

    // Price List Upload Functionality
    const uploadPriceBtn = document.getElementById('upload-price-btn');
    const priceFileInput = document.getElementById('price-file-input');
    const priceFileStatus = document.getElementById('price-file-status');

    uploadPriceBtn.addEventListener('click', () => {
        priceFileInput.click();
    });

    priceFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            priceFileStatus.textContent = '❌ Please select a CSV file';
            priceFileStatus.className = 'file-status error';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvContent = event.target.result;
                parsePriceList(csvContent);
                priceFileStatus.textContent = `✓ Loaded: ${file.name}`;
                priceFileStatus.className = 'file-status success';
                updateInventory(); // Refresh the inventory table with new prices
            } catch (error) {
                priceFileStatus.textContent = '❌ Error parsing CSV file';
                priceFileStatus.className = 'file-status error';
                console.error('CSV Parse Error:', error);
            }
        };
        reader.readAsText(file);
    });

    /**
     * Parse CSV price list and update tilePrices object
     * Expected format: Name,SKU,Price (ex VAT / without Transport),Stock,Container
     */
    function parsePriceList(csvContent) {
        const lines = csvContent.split('\n');
        let cutTileLeftPrice = 0;
        let cutTileRightPrice = 0;

        // Skip header row (index 0), start from index 1
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV line (handle quoted fields)
            const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            if (!parts || parts.length < 3) continue;

            const name = parts[0].replace(/"/g, '').trim();
            const sku = parts[1].replace(/"/g, '').trim();
            const priceStr = parts[2].replace(/"/g, '').trim();

            // Extract numeric price (remove €, spaces, and convert comma to dot)
            const priceMatch = priceStr.match(/[\d,\.]+/);
            if (!priceMatch) continue;
            const price = parseFloat(priceMatch[0].replace(',', '.'));

            // Map SKU and name to tile titles
            if (sku === 'PL.100.01.00' || name.toLowerCase().includes('tile 1m x 1m')) {
                tilePrices['Tile 1m × 1m'] = price;
            } else if (name.toLowerCase().includes('tile0,5m x 1m') || name.toLowerCase().includes('0.5m x 1m')) {
                tilePrices['Tile 1m × 0.5m'] = price;
            } else if (sku === 'PL.100.04.00' || name.toLowerCase().includes('ramp cut left')) {
                tilePrices['Ramp Cut Left'] = price;
            } else if (sku === 'PL.100.06.00' || name.toLowerCase().includes('ramp cut right')) {
                tilePrices['Ramp Cut Right'] = price;
            } else if (sku === 'PL.100.05.00' || name.toLowerCase().includes('ramp corner')) {
                tilePrices['Ramp Corner'] = price;
            } else if (sku === 'PL.100.07.00' || name.toLowerCase().includes('ramp 1m')) {
                tilePrices['Ramp 1m'] = price;
            } else if (sku === 'PL.100.08.00' || name.toLowerCase().includes('ramp 0,5m')) {
                tilePrices['Ramp 0.5m'] = price;
            } else if (sku === 'PL.100.02.00' || name.toLowerCase().includes('cut tile left')) {
                cutTileLeftPrice = price;
            } else if (sku === 'PL.100.03.00' || name.toLowerCase().includes('cut tile right')) {
                cutTileRightPrice = price;
            }
        }

        // Calculate 3D Deltas precut tiles price (sum of cut tile left + right)
        if (cutTileLeftPrice > 0 && cutTileRightPrice > 0) {
            tilePrices['3D Deltas precut tiles'] = cutTileLeftPrice + cutTileRightPrice;
        }

        console.log('Updated prices:', tilePrices);
    }
});

