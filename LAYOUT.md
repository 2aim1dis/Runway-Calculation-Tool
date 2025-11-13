# Runway Calculation - Layout Documentation

**Last Updated:** November 13, 2025

---

## Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    <body> - overflow: hidden                    │
│         <div class="main-container"> - CSS Grid                 │
│      display: grid; grid-template-columns: 1fr 1fr 1fr         │
│                  width: 100vw; height: 100vh                    │
├────────┬──────────────────────────────────────────┬─────────────┤
│        │                                          │             │
│ LEFT   │          CENTER                          │    RIGHT    │
│  1fr   │           1fr                            │     1fr     │
│ ~33.3% │          ~33.3%                          │   ~33.3%    │
│        │                                          │             │
│<div    │ <div class="container">                  │<div class= │
│class=  │   display: flex                          │"inventory- │
│"tile-  │   align-items: flex-start                │panel">     │
│palette>│   justify-content: center                │  display:  │
│        │   position: relative                     │  flex      │
│bg:#f5f5│   background: #ffffff                    │  flex-dir: │
│padding:│   padding: 12px 0                        │  column    │
│16px 20p│                                          │bg:linear-  │
│border- │  <div class="svg-wrapper">               │gradient    │
│right:  │    position: relative                    │padding:16px│
│2px     │    width: 100%; height: 100%             │border-left │
│overflow│    display: flex                         │overflow:   │
│-y:auto │    align-items: flex-start               │hidden      │
│        │    justify-content: center               │            │
│<h3>    │                                          │<h3>        │
│"Avail- │   <div class="zoom-controls">            │"Objects in │
│able    │     position: absolute                   │Grid"       │
│Tiles"  │     top: 18px; right: 24px               │font:22px   │
│font:20p│     display: flex; gap: 12px             │margin:0 0  │
│        │     z-index: 10                          │16px        │
│Tiles:  │                                          │            │
│        │     <button class="zoom-btn">            │<table      │
│100×100 │       [+] [-] [⊙] [✕]                    │class=      │
│blue    │       width: 35px; height: 35px          │"inventory- │
│#4a90e2 │       border-radius: 50%                 │table">     │
│        │       border: 2px solid #4a90e2          │  width:100%│
│1m×0.5m │       background: #ffffff                │  border-   │
│grey    │       font-size: 14px                    │  radius:14p│
│#5a6c7d │                                          │  box-      │
│PL.100. │   <p class="grid-instruction">           │  shadow:0  │
│01.01   │     position: absolute                   │  2px 6px   │
│        │     top: 20px; left: 50%                 │            │
│Ramp 1m │     transform: translateX(-50%)          │<thead>     │
│orange  │     font-size: 13px                      │  bg:linear-│
│#e8a87c │     z-index: 5                           │  gradient  │
│PL.100. │     "💡 Tip: Right-click to rotate      │  (135deg,  │
│07.00   │      • Double-click to delete"           │  #4a90e2,  │
│        │                                          │  #357abd)  │
│Ramp    │   <svg id="runway-svg"                   │  color:#fff│
│0.5m    │     viewBox="0 0 1200 1200"              │  sticky:top│
│orange  │     width: 92%                           │            │
│#e8a87c │     height: auto                         │<tr>        │
│PL.100. │     border: 1px solid #d7dfe6            │  <th>      │
│08.00   │     border-radius: 12px                  │  "Object"  │
│        │     cursor: grab                         │  <th>      │
│Ramp    │     box-shadow: 0 2px 4px                │  "Count"   │
│Corner  │                                          │  padding:  │
│yellow  │     <defs>                               │  10px 14px │
│#ffd700 │       <pattern id="grid"                 │  font:13px │
│50×50   │         width="50" height="50"           │            │
│L-shape │         patternUnits="userSpaceOnUse">   │<tbody      │
│PL.100. │         <path stroke="#ddd"/>            │id=         │
│05.00   │       </pattern>                         │"inventory- │
│        │     </defs>                              │body">      │
│Ramp Cut│                                          │            │
│Right   │     <rect fill="url(#grid)"/>            │<tr>        │
│green   │                                          │  <td>      │
│#90ee90 │     <g id="runway-group"                 │  "3D Deltas│
│100×25  │       transform="translate(600,600)      │  precut    │
│angled  │                  scale(0.1,-0.1)">       │  tiles"    │
│PL.100. │                                          │  <td class=│
│06.00   │       <!-- 31 LINE elements -->          │  "count-   │
│        │       <!-- 26 PATH (arc) elements -->    │  cell">    │
│Ramp Cut│       <text>"3D Deltas precut tiles"     │  "1"       │
│Left    │       <text id="dimensions"              │  text-     │
│green   │             opacity:0                    │  align:    │
│#90ee90 │             "200cm × 100cm"              │  center    │
│100×25  │             (shows on hover)             │  font-     │
│angled  │                                          │  weight:600│
│PL.100. │     </g>                                 │  color:    │
│04.00   │                                          │  #2368b0   │
│        │     <!-- Dropped tiles appear here -->   │            │
│        │   </svg>                                 │Dynamic rows│
│        │                                          │for dropped │
│        │ </div> <!-- svg-wrapper -->              │tiles based │
│        │</div> <!-- container -->                 │on          │
│        │                                          │inventory{} │
│        │                                          │object      │
└────────┴──────────────────────────────────────────┴─────────────┘
   ↑                        ↑                            ↑
overflow-y: auto     cursor changes:        overflow: hidden
                     grab → grabbing
                     on mousedown
                     Grid snapping:
                     - 50cm for rect tiles
                     - 25cm for corner/polygons
```

---

## Tile Catalog

### Available Tiles

| Title | Dimensions | Shape | Color | Part Number | Data Attributes |
|-------|-----------|-------|-------|-------------|-----------------|
| 100cm × 100cm | 100×100cm | Rectangle | Blue (#4a90e2) | - | data-width="100" data-height="100" data-tile-title="100cm × 100cm" |
| Tile 1m × 0.5m | 100×50cm | Rectangle | Grey (#5a6c7d) | PL.100.01.01 | data-width="100" data-height="50" data-tile-title="Tile 1m × 0.5m" |
| Ramp 1m | 100×25cm | Rectangle | Orange (#e8a87c) | PL.100.07.00 | data-width="100" data-height="25" data-tile-title="Ramp 1m" |
| Ramp 0.5m | 50×25cm | Rectangle | Orange (#e8a87c) | PL.100.08.00 | data-width="50" data-height="25" data-tile-title="Ramp 0.5m" |
| Ramp Corner | 50×50cm | Polygon (L-shape) | Yellow (#ffd700) | PL.100.05.00 | data-width="50" data-height="50" data-tile-title="Ramp Corner" |
| Ramp Cut Right | 100×25cm | Polygon (angled) | Green (#90ee90) | PL.100.06.00 | data-width="100" data-height="25" data-tile-title="Ramp Cut Right" data-cut-type="right" |
| Ramp Cut Left | 100×25cm | Polygon (angled) | Green (#90ee90) | PL.100.04.00 | data-width="100" data-height="25" data-tile-title="Ramp Cut Left" data-cut-type="left" |

---

## CSS Class Reference

### Main Container
**`.main-container`**
- `display: grid`
- `grid-template-columns: 1fr 1fr 1fr`
- `height: 100vh`
- `width: 100vw`
- `overflow: hidden`

**Ratio:** 1 : 1 : 1 (Equal thirds - 33.3% each)

---

### Left Panel - Available Tiles

**`.tile-palette`**
- `background: #f5f5f5`
- `padding: 16px 20px`
- `border-right: 2px solid #e1e5ea`
- `overflow-y: auto`
- `display: flex`
- `flex-direction: column`
- `gap: 16px`

**`.tile-palette h3`**
- `margin: 0`
- `font-size: 20px`
- `font-weight: 700`
- `letter-spacing: .5px`
- `color: #2c3e50`

**`.palette-section`**
- `margin-bottom: 5px`

**`.palette-section h4`**
- `margin: 0 0 8px`
- `color: #2c3e50`
- `font-size: 14px`
- `font-weight: 600`

**`.palette-tile`**
- `padding: 14px 12px`
- `background: #ffffff`
- `border: 1px solid #d7dfe6`
- `border-radius: 12px`
- `cursor: move`
- `transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease`
- `display: flex`
- `justify-content: center`
- `box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.02)`

**`.palette-tile:hover`**
- `border-color: #4a90e2`
- `box-shadow: 0 4px 12px rgba(74,144,226,0.25)`
- `transform: translateY(-2px)`

**`.palette-tile svg`**
- `max-width: 50%`
- `height: auto`

---

### Center Panel - Grid

**`.container`**
- `display: flex`
- `align-items: center`
- `justify-content: center`
- `position: relative`
- `background: #ffffff`
- `padding: 12px 0`

**`.svg-wrapper`**
- `position: relative`
- `width: 100%`
- `height: 100%`
- `max-width: 100%`
- `display: flex`
- `align-items: flex-start`
- `justify-content: center`

**`.grid-instruction`**
- `position: absolute`
- `top: 20px`
- `left: 50%`
- `transform: translateX(-50%)`
- `font-size: 13px`
- `color: #64748b`
- `background: rgba(255, 255, 255, 0.95)`
- `padding: 8px 16px`
- `border-radius: 8px`
- `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)`
- `border: 1px solid #e1e5ea`
- `font-style: italic`
- `z-index: 5`
- Text: "💡 Tip: Right-click to rotate • Double-click to delete"

**`.tile-subtitle`**
- `margin: -4px 0 8px`
- `font-size: 11px`
- `color: #64748b`
- `font-style: italic`

**`#runway-svg`**
- `display: block`
- `width: 92%`
- `height: auto`
- `border: 1px solid #d7dfe6`
- `background: #ffffff`
- `border-radius: 12px`
- `cursor: grab`
- `box-shadow: 0 2px 4px rgba(0,0,0,0.06)`
- `viewBox: "0 0 1200 1200"`

**`#runway-svg:active`**
- `cursor: grabbing`

**`.zoom-controls`**
- `position: absolute`
- `top: 18px`
- `right: 24px`
- `display: flex`
- `gap: 12px`
- `z-index: 10`

**`.zoom-btn`**
- `width: 35px`
- `height: 35px`
- `border: 2px solid #4a90e2`
- `background: #ffffff`
- `border-radius: 50%`
- `font-size: 14px`
- `font-weight: 600`
- `color: #2368b0`
- `cursor: pointer`
- `display: flex`
- `align-items: center`
- `justify-content: center`
- `transition: background .25s ease, color .25s ease, transform .25s ease, box-shadow .25s ease`
- `box-shadow: 0 1px 2px rgba(0,0,0,0.08)`

**`.zoom-btn:hover`**
- `background: #4a90e2`
- `color: #ffffff`
- `transform: translateY(-2px)`
- `box-shadow: 0 4px 12px rgba(74,144,226,0.35)`

**`.zoom-btn:active`**
- `transform: scale(.92)`
- `box-shadow: 0 2px 6px rgba(74,144,226,0.35)`

---

### Right Panel - Objects in Grid

**`.inventory-panel`**
- `background: linear-gradient(180deg,#f8fafc,#eef2f5)`
- `padding: 16px 24px 24px`
- `border-left: 2px solid #e1e5ea`
- `overflow: hidden`
- `display: flex`
- `flex-direction: column`

**`.inventory-panel h3`**
- `margin: 0 0 16px`
- `font-size: 22px`
- `font-weight: 700`
- `color: #2c3e50`
- `letter-spacing: .5px`

**`.inventory-table`**
- `width: 100%`
- `background: #ffffff`
- `border-collapse: separate`
- `border-spacing: 0`
- `border-radius: 14px`
- `overflow: hidden`
- `box-shadow: 0 2px 6px rgba(0,0,0,0.08)`
- `font-size: 14px`

**`.inventory-table thead`**
- `background: linear-gradient(135deg,#4a90e2,#357abd)`
- `color: #ffffff`
- `position: sticky`
- `top: 0`
- `z-index: 1`

**`.inventory-table th, .inventory-table td`**
- `padding: 10px 14px`
- `text-align: left`
- `border-bottom: 1px solid #e1e5ea`

**`.inventory-table th`**
- `font-weight: 600`
- `font-size: 13px`
- `letter-spacing: .3px`

**`.inventory-table td`**
- `font-size: 13px`
- `color: #2f3a44`

**`.inventory-table tbody tr:hover`**
- `background: #f5faff`

**`.inventory-table tbody tr:nth-child(even)`**
- `background: #fafcff`

**`.inventory-table .count-cell`**
- `text-align: center`
- `font-weight: 600`
- `color: #2368b0`

---

## SVG Grid Specifications

### Grid Pattern
- **Pattern ID:** `grid`
- **Grid Unit:** 50cm × 50cm (50px × 50px)
- **Pattern Units:** `userSpaceOnUse`
- **Grid Color:** `#ddd` (light gray)
- **Total ViewBox:** 1200 × 1200 (12m × 12m)
- **Grid Cells:** 24 × 24

### Runway Group
- **Transform:** `translate(600, 600) scale(0.1, -0.1)`
- **Position:** Centered in grid
- **Size:** 200cm × 100cm (2000 × 1000 units before scale)
- **Geometry:** 31 LINE elements + 26 ARC (PATH) elements
- **Stroke:** `#2c3e50` (dark blue-gray)
- **Stroke Width:** 2px

### Dropped Tiles
- **Class:** `dropped-tile`
- **Snapping:** 50cm grid for rectangles, 25cm grid for polygons (corners)
- **Opacity:** `fill-opacity: 0.7`
- **Stroke:** `#2c3e50`, width 2px
- **Data Attributes:**
  - `data-tile-name` - Title for inventory tracking
  - `data-corner-x`, `data-corner-y` - Position for polygon shapes
  - `data-shape-type` - "corner", "right", "left" for rotation logic
  - `data-rotation` - Current rotation angle (0, 90, 180, 270)
  - `data-width`, `data-height` - Original dimensions for angled ramps

### Interactive Elements
- **Hover Text:** "200cm × 100cm" (initially `opacity: 0`)
- **Title Text:** "3D Deltas precut tiles"
- **Hover Area:** Transparent rect covering entire runway
- **Drag & Drop:** HTML5 drag API with grid snapping
- **Double-click:** Delete tile and update inventory
- **Right-click:** Rotate tile 90° clockwise (with shape-specific logic)

---

## JavaScript Variables & IDs

### DOM Element IDs
- `#runway-svg` - Main SVG canvas
- `#runway-group` - Runway shape group
- `#dimensions` - Hover dimension text
- `#zoom-in` - Zoom in button
- `#zoom-out` - Zoom out button
- `#zoom-reset` - Reset zoom button
- `#clear-grid` - Clear all dropped tiles button
- `#inventory-body` - Table tbody for dynamic rows

### Data Attributes
**Palette Tiles:**
- `data-width` - Tile width in cm
- `data-height` - Tile height in cm
- `data-tile-title` - Display name for inventory
- `data-cut-type` - "right" or "left" for angled ramps
- `draggable="true"` - Enables HTML5 drag API

**Dropped Tiles:**
- `data-tile-name` - Matches data-tile-title from palette
- `data-corner-x`, `data-corner-y` - Top-left position for polygons
- `data-shape-type` - Shape identifier for rotation
- `data-rotation` - Current rotation state
- `class="dropped-tile"` - Selector for cleanup

### Inventory System
- **Object:** `inventory = {}` - Stores tile counts
- **Function:** `updateInventory()` - Rebuilds table from inventory object
- **Format:** `{ "Tile 1m × 0.5m": 3, "Ramp Corner": 1, ... }`

### ViewBox State
- **Initial:** `0 0 1200 1200`
- **Zoom Factor:** ±20% per click
- **Pan:** Mouse drag translates viewBox x/y
- **Reset:** Returns to original viewBox

---

## Color Palette

### Tile Colors
- **Square Tile (100×100):** `#4a90e2` (blue)
- **Rectangular Tile (1m×0.5m):** `#5a6c7d` (dark grey)
- **Ramps (1m, 0.5m):** `#e8a87c` (orange)
- **Ramp Corner:** `#ffd700` (yellow/gold)
- **Angled Ramps (Cut Left/Right):** `#90ee90` (light green)

### Primary Colors
- **Blue (Primary):** `#4a90e2`
- **Blue (Dark):** `#357abd`
- **Blue (Text):** `#2368b0`
- **Dark Gray:** `#2c3e50`
- **Grey (Tile):** `#5a6c7d`

### Neutral Colors
- **White:** `#ffffff`
- **Light Gray BG:** `#f5f5f5`
- **Light Gray BG 2:** `#f8fafc`
- **Light Gray BG 3:** `#eef2f5`
- **Border Gray:** `#e1e5ea`
- **Border Gray 2:** `#d7dfe6`
- **Grid Gray:** `#ddd`
- **Text Gray:** `#2f3a44`
- **Text Gray 2:** `#475569`
- **Text Gray 3:** `#64748b`

### Hover/Interaction Colors
- **Hover BG:** `#f5faff`
- **Even Row BG:** `#fafcff`

---

## Interactive Features

### Drag & Drop
- Tiles draggable from left palette
- Drop on SVG grid with automatic snapping
- Grid snapping: 50cm for rectangles, 25cm for corner pieces
- Visual feedback: cursor changes, hover effects

### Zoom & Pan
- **Zoom In:** Button or mouse wheel up (+20%)
- **Zoom Out:** Button or mouse wheel down (-20%)
- **Reset Zoom:** Button returns to original view
- **Pan:** Click and drag background to move view
- **Cursor-centered zoom:** Wheel zooms toward mouse position

### Tile Manipulation
- **Move:** Click and drag placed tiles, snaps to grid
- **Rotate:** Right-click rotates 90° clockwise
  - Rectangles: Swap width/height
  - Corner: 4 orientations (which corner is missing)
  - Angled ramps: 4 orientations (direction of cut)
- **Delete:** Double-click removes tile and updates inventory
- **Clear All:** Clear grid button (✕) removes all dropped tiles

### Inventory Tracking
- Automatically counts tiles as they're dropped
- Updates in real-time when tiles added/removed
- Always shows "3D Deltas precut tiles" runway (count: 1)
- Dynamic rows for each tile type placed
- Clears when "Clear Grid" button clicked

---

## File Structure

```
Runway Calculation/
├── index.html          # Main HTML structure
├── styles.css          # All styling and layout
├── script.js           # Interactive functionality
├── Runway.DXF          # Source CAD file (4785 lines)
├── LAYOUT.md           # This documentation file
└── .github/
    └── copilot-instructions.md
```

---

## Browser Compatibility Notes

- **CSS Grid:** Supported in all modern browsers
- **SVG:** Full support
- **Flexbox:** Full support
- **HTML5 Drag API:** Full support
- **Sticky Positioning:** Full support (table header)

**Recommended:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

*This document is automatically updated when layout changes are made.*
