import math

def angle_to_radians(deg):
    return deg * math.pi / 180

def arc_to_svg(center, radius, start_deg, end_deg, current_x, current_y):
    """Convert DXF arc to SVG arc command"""
    start_rad = angle_to_radians(start_deg)
    end_rad = angle_to_radians(end_deg)
    
    end_x = center[0] + radius * math.cos(end_rad)
    end_y = center[1] + radius * math.sin(end_rad)
    
    # Determine sweep direction and large arc flag
    angle_diff = (end_deg - start_deg) % 360
    large_arc = 1 if angle_diff > 180 else 0
    sweep = 1 if angle_diff > 0 else 0
    
    return f"A {radius:.3f},{radius:.3f} 0 {large_arc},{sweep} {end_x:.3f},{end_y:.3f}"

# Read DXF
with open('Runway.DXF', 'r') as f:
    lines = f.readlines()

# Parse all entities
entities = []
i = 0
while i < len(lines):
    line = lines[i].strip()
    
    if line == 'LINE':
        entity = {'type': 'LINE'}
        i += 1
        while i < len(lines) and lines[i].strip() not in ['LINE', 'ARC', 'ENDSEC']:
            code = lines[i].strip()
            if code == '10':
                entity['x1'] = float(lines[i+1].strip())
            elif code == '20':
                entity['y1'] = float(lines[i+1].strip())
            elif code == '11':
                entity['x2'] = float(lines[i+1].strip())
            elif code == '21':
                entity['y2'] = float(lines[i+1].strip())
            i += 1
        if 'x1' in entity:
            entities.append(entity)
        continue
    
    elif line == 'ARC':
        entity = {'type': 'ARC'}
        i += 1
        while i < len(lines) and lines[i].strip() not in ['LINE', 'ARC', 'ENDSEC']:
            code = lines[i].strip()
            if code == '10':
                entity['cx'] = float(lines[i+1].strip())
            elif code == '20':
                entity['cy'] = float(lines[i+1].strip())
            elif code == '40':
                entity['r'] = float(lines[i+1].strip())
            elif code == '50':
                entity['start'] = float(lines[i+1].strip())
            elif code == '51':
                entity['end'] = float(lines[i+1].strip())
            i += 1
        if 'cx' in entity:
            entities.append(entity)
        continue
    
    i += 1

print(f"Found {len(entities)} entities")

# Find the boundary path by connecting entities
# Looking for the cleared area boundary (octagonal with rounded corners)
cleared_area_lines = []
cleared_area_arcs = []

for e in entities:
    if e['type'] == 'LINE':
        x1, y1, x2, y2 = e['x1'], e['y1'], e['x2'], e['y2']
        # Check if this line is part of the octagonal cleared area
        # The octagon has coordinates around ±288, ±596, ±264, ±87
        if (abs(abs(x1) - 596) < 10 or abs(abs(x1) - 288) < 10 or 
            abs(abs(y1) - 264) < 10 or abs(abs(y1) - 87) < 10):
            cleared_area_lines.append(e)
    elif e['type'] == 'ARC':
        # Arcs with radius around 5 are the small corner rounds
        if 4 < e['r'] < 6:
            cleared_area_arcs.append(e)

print(f"\nCleared area: {len(cleared_area_lines)} lines, {len(cleared_area_arcs)} arcs")

# Generate the SVG path for the octagonal cleared area
# Start from top-right and go clockwise
svg_path = "M 288.661,-264.481"

# Add each segment (this needs proper ordering)
print("\nGenerated SVG path preview:")
print(svg_path[:100])
