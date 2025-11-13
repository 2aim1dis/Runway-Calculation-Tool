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

