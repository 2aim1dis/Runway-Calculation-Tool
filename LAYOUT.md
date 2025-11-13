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
│"tile-  │   align-items: center                    │panel">     │
│palette>│   justify-content: center                │  display:  │
│        │   position: relative                     │  flex      │
│bg:#f5f5│   background: #ffffff                    │  flex-dir: │
│padding:│   padding: 12px 0                        │  column    │
│16px 20p│                                          │bg:linear-  │
│border- │  <div class="svg-wrapper">               │gradient    │
│right:  │    position: relative                    │padding:16px│
│2px     │    width: 100%; height: 100%             │border-left │
│overflow│    display: flex                         │overflow:   │
│-y:auto │    align/justify: center                 │hidden      │
│        │                                          │            │
│<h3>    │   <div class="zoom-controls">            │<h3>        │
│"Avail- │     position: absolute                   │"Objects in │
│able    │     top: 18px; right: 24px               │Grid"       │
│Tiles"  │     display: flex; gap: 12px             │font:22px   │
│font:20p│     z-index: 10                          │margin:0 0  │
│        │                                          │16px        │
│<div    │     <button class="zoom-btn">            │            │
│class=  │       [+] [-] [⊙]                        │<table      │
│"palette│       width: 44px; height: 44px          │class=      │
│-section│       border-radius: 50%                 │"inventory- │
│">      │       border: 2px solid #4a90e2          │table">     │
│        │       background: #ffffff                │  width:100%│
│<h4>    │                                          │  border-   │
│"100cm× │   <svg id="runway-svg"                   │  radius:14p│
│100cm"  │     viewBox="0 0 1200 1200"              │  box-      │
│font:14p│     width: 92%                           │  shadow:0  │
│        │     height: auto                         │  2px 6px   │
│<div    │     border: 1px solid #d7dfe6            │            │
│class=  │     border-radius: 12px                  │<thead>     │
│"palette│     cursor: grab                         │  bg:linear-│
│-tile"  │     box-shadow: 0 2px 4px                │  gradient  │
│draggab-│                                          │  (135deg,  │
│le=true │     <defs>                               │  #4a90e2,  │
│data-   │       <pattern id="grid"                 │  #357abd)  │
│width=  │         width="50" height="50"           │  color:#fff│
│"100"   │         patternUnits="userSpaceOnUse">   │  sticky:top│
│data-   │         <path stroke="#ddd"/>            │            │
│height= │       </pattern>                         │<tr>        │
│"100">  │     </defs>                              │  <th>      │
│        │                                          │  "Object"  │
│  <svg> │     <rect fill="url(#grid)"/>            │  <th>      │
│  30×30p│                                          │  "Count"   │
│  viewBo│     <g id="runway-group"                 │  padding:  │
│  x="0 0│       transform="translate(600,600)      │  10px 14px │
│  100   │                  scale(0.1,-0.1)">       │  font:13px │
│  100"> │                                          │            │
│   <rect│       <!-- 31 LINE elements -->          │<tbody      │
│   fill:│       <!-- 26 PATH (arc) elements -->    │id=         │
│   #4a90│       <text>"3D Deltas precut tiles"     │"inventory- │
│   e2   │       <text id="dimensions"              │body">      │
│   strok│             opacity:0                    │            │
│   e:#2c│             "200cm × 100cm"              │<tr>        │
│   3e50 │             (shows on hover)             │  <td>      │
│        │                                          │  "3D Deltas│
│[100×50]│     </g>                                 │  precut    │
│tile    │                                          │  tiles"    │
│        │   </svg>                                 │  <td class=│
│        │                                          │  "count-   │
│        │ </div> <!-- svg-wrapper -->              │  cell">    │
│        │</div> <!-- container -->                 │  "1"       │
│        │                                          │  text-     │
│        │                                          │  align:    │
│        │                                          │  center    │
│        │                                          │  font-     │
│        │                                          │  weight:600│
│        │                                          │  color:    │
│        │                                          │  #2368b0   │
│        │                                          │            │
└────────┴──────────────────────────────────────────┴─────────────┘
   ↑                        ↑                            ↑
overflow-y: auto     cursor changes:        overflow: hidden
                     grab → grabbing
                     on mousedown
```

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
- `align-items: center`
- `justify-content: center`

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
- `width: 44px`
- `height: 44px`
- `border: 2px solid #4a90e2`
- `background: #ffffff`
- `border-radius: 50%`
- `font-size: 18px`
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

### Interactive Elements
- **Hover Text:** "200cm × 100cm" (initially `opacity: 0`)
- **Title Text:** "3D Deltas precut tiles"
- **Hover Area:** Transparent rect covering entire runway

---

## JavaScript Variables & IDs

### DOM Element IDs
- `#runway-svg` - Main SVG canvas
- `#runway-group` - Runway shape group
- `#dimensions` - Hover dimension text
- `#zoom-in` - Zoom in button
- `#zoom-out` - Zoom out button
- `#zoom-reset` - Reset zoom button
- `#inventory-body` - Table tbody for dynamic rows

### Data Attributes
- `data-width` - Tile width in cm (100)
- `data-height` - Tile height in cm (100 or 50)
- `draggable="true"` - Enables HTML5 drag API

### ViewBox State
- **Initial:** `0 0 1200 1200`
- **Zoom Factor:** ±20% per click
- **Pan:** Mouse drag translates viewBox x/y

---

## Color Palette

### Primary Colors
- **Blue (Primary):** `#4a90e2`
- **Blue (Dark):** `#357abd`
- **Blue (Text):** `#2368b0`
- **Dark Gray:** `#2c3e50`
- **Red (Accent):** `#e74c3c`

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
