## Runway Calculation Tool (React)

A React + Vite rebuild of the Kinvent Runway Calculator. Drag tiles from the palette onto the SVG runway grid, zoom/rotate tiles, and export inventory or layout snapshots.

### 🧰 Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+

Install dependencies once:

```powershell
npm install
```

### 🚀 Live preview while developing
Vite provides hot-module reloading so you can see every change instantly.

```powershell
# default localhost preview
npm run dev

# expose to your LAN / another device if needed
npm run dev -- --host 0.0.0.0 --port 5174
```

Open the URL printed in the terminal (usually http://localhost:5173). Keep this server running while you edit files; the browser refreshes automatically.

If you want to verify the production build but still preview it locally, use:

```powershell
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

### 📦 Production build & deployment

```powershell
npm run build
```

The optimized assets land in `dist/`. Upload that folder to any static host (GitHub Pages, Netlify, etc.). For GitHub Pages you can copy `dist/*` to the repository root on the `gh-pages` branch or configure an action to publish `dist` after each build.

### ✅ Quality checks
- `npm run lint` – ESLint with React hooks rules
- `npm run build` – verifies the Vite production bundle succeeds

### 🧭 Key directories
- `src/context/RunwayContext.jsx` – global state (tiles, zoom, presets)
- `src/components/RunwayGrid.jsx` – SVG canvas, drag/drop, zoom controls
- `src/components/InventoryPanel.jsx` – pricing table + CSV export
- `src/components/TilePalette.jsx` – draggable tile catalog
- `src/components/CalculatorPanel.jsx` – quick runway estimator

Enjoy experimenting—keep the dev server running to instantly check every change.
