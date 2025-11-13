import math

def angle_to_radians(deg):
    return deg * math.pi / 180

def arc_endpoint(center, radius, angle_deg):
    """Calculate endpoint of arc at given angle"""
    angle_rad = angle_to_radians(angle_deg)
    x = center[0] + radius * math.cos(angle_rad)
    y = center[1] + radius * math.sin(angle_rad)
    return (x, y)

# Read the DXF file
with open('Runway.DXF', 'r') as f:
    content = f.read()

# Extract all LINE entities
lines = []
arcs = []

# Split into entities
entities = content.split('LINE\n')
for entity in entities[1:]:
    lines_in_entity = entity.split('\n')
    x1 = y1 = x2 = y2 = None
    
    for i, line in enumerate(lines_in_entity):
        if line.strip() == '10':
            x1 = float(lines_in_entity[i+1].strip())
        elif line.strip() == '20':
            y1 = float(lines_in_entity[i+1].strip())
        elif line.strip() == '11':
            x2 = float(lines_in_entity[i+1].strip())
        elif line.strip() == '21':
            y2 = float(lines_in_entity[i+1].strip())
    
    if x1 is not None and y1 is not None and x2 is not None and y2 is not None:
        lines.append(((x1, y1), (x2, y2)))

# Extract all ARC entities
arc_entities = content.split('ARC\n')
for entity in arc_entities[1:]:
    lines_in_entity = entity.split('\n')
    cx = cy = radius = start_angle = end_angle = None
    
    for i, line in enumerate(lines_in_entity):
        if line.strip() == '10':
            cx = float(lines_in_entity[i+1].strip())
        elif line.strip() == '20':
            cy = float(lines_in_entity[i+1].strip())
        elif line.strip() == '40':
            radius = float(lines_in_entity[i+1].strip())
        elif line.strip() == '50':
            start_angle = float(lines_in_entity[i+1].strip())
        elif line.strip() == '51':
            end_angle = float(lines_in_entity[i+1].strip())
    
    if cx is not None and cy is not None and radius is not None:
        start_pt = arc_endpoint((cx, cy), radius, start_angle)
        end_pt = arc_endpoint((cx, cy), radius, end_angle)
        arcs.append({
            'center': (cx, cy),
            'radius': radius,
            'start_angle': start_angle,
            'end_angle': end_angle,
            'start_pt': start_pt,
            'end_pt': end_pt
        })

# Generate SVG path for the OUTER boundary (clockwise from top right)
# This should be the rectangular outer boundary
outer_path = "M 0.5,338.8 L 101.286,338.8 L 160.971,338.204 L 176.078,329.481 L 182.908,331.311 L 197.908,357.292"

# Add arcs at corners
for arc in arcs[:3]:  # First 3 small arcs (r=5)
    sweep = 1 if (arc['end_angle'] - arc['start_angle']) > 0 else 0
    outer_path += f" A {arc['radius']},{arc['radius']} 0 0,{sweep} {arc['end_pt'][0]:.3f},{arc['end_pt'][1]:.3f}"

outer_path += " L 300.001,304.122 L 288.661,264.481 L 596,87.039 L 596,34.062"

# Continue path
outer_path += " L 596,-34.062 L 596,-87.039 L 161.098,-338.130 L 101.286,-338.8 L 0.5,-338.8 L 0.5,-500 L 1000,-500 L 1000,500 L 0.5,500 Z"

# Generate path for octagonal center hole
center_hole = "M 288.661,264.481 L 596,87.039 L 596,-87.039 L 288.661,-264.481 L -288.661,-264.481 L -596,-87.039 L -596,87.039 L -288.661,264.481 Z"

# Mirror for left side
left_path = "M -0.5,338.8 L -101.286,338.8 L -160.971,338.204 L -176.078,329.481 L -182.908,331.311 L -197.908,357.292 L -204.738,359.122 L -300.001,304.122 L -288.661,264.481 L -596,87.039 L -596,34.062 L -596,-34.062 L -596,-87.039 L -160.971,-338.204 L -101.286,-338.8 L -0.5,-338.8 L -0.5,-500 L -1000,-500 L -1000,500 L -0.5,500 Z"

print("SVG paths generated!")
print("\nOuter (right) path:")
print(outer_path[:200] + "...")
print("\nCenter hole:")
print(center_hole)
print("\nLeft path:")
print(left_path[:200] + "...")
