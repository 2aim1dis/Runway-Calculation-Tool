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
    
    // Drag and Drop functionality
    const paletteTiles = document.querySelectorAll('.palette-tile');
    const svg = document.getElementById('runway-svg');
    let draggedTileData = null;
    
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
        
        // Double click to delete
        tile.addEventListener('dblclick', () => {
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

