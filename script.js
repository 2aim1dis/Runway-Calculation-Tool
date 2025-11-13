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
    
    /**
     * Updates the inventory table to reflect current tiles on grid
     * Always shows the runway (3D Deltas) and any dropped tiles with counts
     */
    function updateInventory() {
        const inventoryBody = document.getElementById('inventory-body');
        inventoryBody.innerHTML = '';
        
        // Always show the runway (permanent fixture)
        const runwayRow = document.createElement('tr');
        runwayRow.innerHTML = `
            <td>3D Deltas precut tiles</td>
            <td class="count-cell">1</td>
        `;
        inventoryBody.appendChild(runwayRow);
        
        // Add dropped tiles dynamically
        Object.keys(inventory).forEach(key => {
            if (inventory[key] > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${key}</td>
                    <td class="count-cell">${inventory[key]}</td>
                `;
                inventoryBody.appendChild(row);
            }
        });
    }
    
    // Handle drag start from palette
    paletteTiles.forEach(tile => {
        tile.addEventListener('dragstart', (e) => {
            draggedTileData = {
                width: parseInt(tile.dataset.width),
                height: parseInt(tile.dataset.height)
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
        
        // Snap to grid (50cm units)
        const snappedX = Math.round(x / 50) * 50;
        const snappedY = Math.round(y / 50) * 50;
        
        // Create new tile on grid
        const newTile = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        newTile.setAttribute('x', snappedX);
        newTile.setAttribute('y', snappedY);
        newTile.setAttribute('width', draggedTileData.width);
        newTile.setAttribute('height', draggedTileData.height);
        newTile.setAttribute('fill', draggedTileData.width === 100 && draggedTileData.height === 100 ? '#4a90e2' : '#e74c3c');
        newTile.setAttribute('fill-opacity', '0.7');
        newTile.setAttribute('stroke', '#2c3e50');
        newTile.setAttribute('stroke-width', '2');
        newTile.setAttribute('class', 'dropped-tile');
        newTile.style.cursor = 'move';
        
        // Store tile info as data attribute for inventory tracking
        const tileName = `${draggedTileData.width}cm × ${draggedTileData.height}cm Tile`;
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
        
        tile.addEventListener('mousedown', (e) => {
            selectedElement = tile;
            const svgRect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            
            const mouseX = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
            const mouseY = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
            
            offset = {
                x: mouseX - parseFloat(tile.getAttribute('x')),
                y: mouseY - parseFloat(tile.getAttribute('y'))
            };
        });
        
        svg.addEventListener('mousemove', (e) => {
            if (selectedElement) {
                e.preventDefault();
                const svgRect = svg.getBoundingClientRect();
                const viewBox = svg.viewBox.baseVal;
                
                const mouseX = (e.clientX - svgRect.left) / svgRect.width * viewBox.width + viewBox.x;
                const mouseY = (e.clientY - svgRect.top) / svgRect.height * viewBox.height + viewBox.y;
                
                const newX = Math.round((mouseX - offset.x) / 50) * 50;
                const newY = Math.round((mouseY - offset.y) / 50) * 50;
                
                selectedElement.setAttribute('x', newX);
                selectedElement.setAttribute('y', newY);
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
});

