import math

def angle_to_radians(deg):
    return deg * math.pi / 180

# Read DXF
with open('Runway.DXF', 'r') as f:
    content = f.read()

# Parse all LINE entities
line_entities = []
arc_entities = []

# Split by LINE
parts = content.split('\n  0\nLINE\n')
for part in parts[1:]:
    lines = part.split('\n')
    entity = {}
    i = 0
    while i < len(lines):
        code = lines[i].strip()
        if i + 1 < len(lines):
            value = lines[i + 1].strip()
            if code == '10':
                entity['x1'] = float(value)
            elif code == '20':
                entity['y1'] = float(value)
            elif code == '11':
                entity['x2'] = float(value)
            elif code == '21':
                entity['y2'] = float(value)
        i += 1
    if 'x1' in entity and 'x2' in entity:
        line_entities.append(entity)

# Split by ARC
parts = content.split('\n  0\nARC\n')
for part in parts[1:]:
    lines = part.split('\n')
    entity = {}
    i = 0
    while i < len(lines):
        code = lines[i].strip()
        if i + 1 < len(lines):
            value = lines[i + 1].strip()
            try:
                if code == '10':
                    entity['cx'] = float(value)
                elif code == '20':
                    entity['cy'] = float(value)
                elif code == '40':
                    entity['r'] = float(value)
                elif code == '50':
                    entity['start_angle'] = float(value)
                elif code == '51':
                    entity['end_angle'] = float(value)
            except:
                pass
        i += 1
    if 'cx' in entity and 'r' in entity and 'start_angle' in entity:
        arc_entities.append(entity)

print(f"Parsed {len(line_entities)} lines and {len(arc_entities)} arcs")

# Generate HTML with SVG
html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runway Calculation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <svg id="runway-svg" viewBox="-1000 -500 2000 1000" xmlns="http://www.w3.org/2000/svg">
            <!-- Grey background rectangle (200cm x 100cm) -->
            <rect id="background-rect" x="-1000" y="-500" width="2000" height="1000" />
            
            <!-- Lines from DXF -->
            <g class="runway-lines">
'''

# Add all lines
for line in line_entities:
    html_content += f'                <line x1="{line["x1"]:.3f}" y1="{line["y1"]:.3f}" x2="{line["x2"]:.3f}" y2="{line["y2"]:.3f}" />\n'

# Add all arcs
for arc in arc_entities:
    start_rad = angle_to_radians(arc['start_angle'])
    end_rad = angle_to_radians(arc['end_angle'])
    
    start_x = arc['cx'] + arc['r'] * math.cos(start_rad)
    start_y = arc['cy'] + arc['r'] * math.sin(start_rad)
    end_x = arc['cx'] + arc['r'] * math.cos(end_rad)
    end_y = arc['cy'] + arc['r'] * math.sin(end_rad)
    
    # Determine sweep and large arc flags
    angle_diff = (arc['end_angle'] - arc['start_angle']) % 360
    large_arc = 1 if angle_diff > 180 else 0
    sweep = 1 if angle_diff > 0 else 0
    
    html_content += f'                <path d="M {start_x:.3f},{start_y:.3f} A {arc["r"]:.3f},{arc["r"]:.3f} 0 {large_arc},{sweep} {end_x:.3f},{end_y:.3f}" />\n'

html_content += '''            </g>
        </svg>
    </div>
    <script src="script.js"></script>
</body>
</html>'''

# Write to file
with open('index.html', 'w') as f:
    f.write(html_content)

print(f"✓ Generated index.html with {len(line_entities)} lines and {len(arc_entities)} arcs")


# Generate SVG
svg_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runway Calculation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="runway-wrapper">
            <svg id="runway-svg" viewBox="-1050 -550 2100 1100" xmlns="http://www.w3.org/2000/svg">
                <g id="runway-shape">
'''

# Add all lines
for line in line_entities:
    svg_content += f'                    <line x1="{line["x1"]:.3f}" y1="{line["y1"]:.3f}" x2="{line["x2"]:.3f}" y2="{line["y2"]:.3f}" stroke="#2c3e50" stroke-width="2" />\n'

# Add all arcs as paths
for arc in arc_entities:
    start_rad = angle_to_radians(arc['start'])
    end_rad = angle_to_radians(arc['end'])
    
    start_x = arc['cx'] + arc['r'] * math.cos(start_rad)
    start_y = arc['cy'] + arc['r'] * math.sin(start_rad)
    end_x = arc['cx'] + arc['r'] * math.cos(end_rad)
    end_y = arc['cy'] + arc['r'] * math.sin(end_rad)
    
    # Determine sweep and large arc flags
    angle_diff = (arc['end'] - arc['start']) % 360
    large_arc = 1 if angle_diff > 180 else 0
    sweep = 1 if angle_diff > 0 else 0
    
    svg_content += f'                    <path d="M {start_x:.3f},{start_y:.3f} A {arc["r"]:.3f},{arc["r"]:.3f} 0 {large_arc},{sweep} {end_x:.3f},{end_y:.3f}" stroke="#2c3e50" stroke-width="2" fill="none" />\n'

svg_content += '''                </g>
            </svg>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>'''

# Write to file
with open('index.html', 'w') as f:
    f.write(svg_content)

print("✓ Generated index.html from DXF")
print(f"  - {len(line_entities)} lines")
print(f"  - {len(arc_entities)} arcs")

# Generate SVG
svg_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runway Calculation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="runway-wrapper">
            <svg id="runway-svg" viewBox="-1050 -550 2100 1100" xmlns="http://www.w3.org/2000/svg">
                <g id="runway-shape">
'''

# Add all lines
for line in line_entities:
    svg_content += f'                    <line x1="{line["x1"]:.3f}" y1="{line["y1"]:.3f}" x2="{line["x2"]:.3f}" y2="{line["y2"]:.3f}" stroke="#2c3e50" stroke-width="2" />\n'

# Add all arcs as paths
for arc in arc_entities:
    start_rad = angle_to_radians(arc['start'])
    end_rad = angle_to_radians(arc['end'])
    
    start_x = arc['cx'] + arc['r'] * math.cos(start_rad)
    start_y = arc['cy'] + arc['r'] * math.sin(start_rad)
    end_x = arc['cx'] + arc['r'] * math.cos(end_rad)
    end_y = arc['cy'] + arc['r'] * math.sin(end_rad)
    
    # Determine sweep and large arc flags
    angle_diff = (arc['end'] - arc['start']) % 360
    large_arc = 1 if angle_diff > 180 else 0
    sweep = 1 if angle_diff > 0 else 0
    
    svg_content += f'                    <path d="M {start_x:.3f},{start_y:.3f} A {arc["r"]:.3f},{arc["r"]:.3f} 0 {large_arc},{sweep} {end_x:.3f},{end_y:.3f}" stroke="#2c3e50" stroke-width="2" fill="none" />\n'

svg_content += '''                </g>
            </svg>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>'''

# Write to file
with open('index.html', 'w') as f:
    f.write(svg_content)

print("✓ Generated index.html from DXF")
print(f"  - {len(line_entities)} lines")
print(f"  - {len(arc_entities)} arcs")

