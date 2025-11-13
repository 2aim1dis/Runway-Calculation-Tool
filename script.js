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
        svg.style.cursor = 'grab';
    });
    
    svg.addEventListener('mouseleave', () => {
        isPanning = false;
        svg.style.cursor = 'grab';
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

