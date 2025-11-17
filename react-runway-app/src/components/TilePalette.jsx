import './TilePalette.css';

const tiles = [
  {
    title: 'Tile 1m × 1m',
    code: 'PL.100.01.00',
    width: 100,
    height: 100,
    svg: (
      <svg width="60" height="60" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" fill="#4a90e2" stroke="#2c3e50" strokeWidth="2" />
        <text x="50" y="55" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">100×100</text>
      </svg>
    )
  },
  {
    title: 'Tile 1m × 0.5m',
    code: 'PL.100.01.01',
    width: 100,
    height: 50,
    svg: (
      <svg width="60" height="30" viewBox="0 0 100 50">
        <rect x="5" y="5" width="90" height="40" fill="#5a6c7d" stroke="#2c3e50" strokeWidth="2" />
        <text x="50" y="30" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">100×50</text>
      </svg>
    )
  },
  {
    title: 'Ramp 1m',
    code: 'PL.100.07.00',
    width: 100,
    height: 25,
    svg: (
      <svg width="60" height="15" viewBox="0 0 100 25">
        <rect x="5" y="5" width="90" height="15" fill="#e8a87c" stroke="#2c3e50" strokeWidth="2" />
        <text x="50" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">RAMP</text>
      </svg>
    )
  },
  {
    title: 'Ramp 0.5m',
    code: 'PL.100.08.00',
    width: 50,
    height: 25,
    svg: (
      <svg width="30" height="15" viewBox="0 0 50 25">
        <rect x="5" y="5" width="40" height="15" fill="#e8a87c" stroke="#2c3e50" strokeWidth="2" />
        <text x="25" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">RAMP</text>
      </svg>
    )
  },
  {
    title: 'Ramp Corner',
    code: 'PL.100.05.00',
    width: 50,
    height: 50,
    svg: (
      <svg width="30" height="30" viewBox="0 0 50 50">
        <path d="M 5 5 L 45 5 L 45 25 L 25 45 L 5 45 Z" fill="#ffd700" stroke="#2c3e50" strokeWidth="2" />
        <text x="20" y="22" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">CR</text>
      </svg>
    )
  },
  {
    title: 'Ramp Cut Right',
    code: 'PL.100.06.00',
    width: 100,
    height: 25,
    cutType: 'right',
    svg: (
      <svg width="60" height="15" viewBox="0 0 100 25">
        <path d="M 5 5 L 95 5 L 70 20 L 5 20 Z" fill="#90ee90" stroke="#2c3e50" strokeWidth="2" />
        <text x="40" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">R-CUT</text>
      </svg>
    )
  },
  {
    title: 'Ramp Cut Left',
    code: 'PL.100.04.00',
    width: 100,
    height: 25,
    cutType: 'left',
    svg: (
      <svg width="60" height="15" viewBox="0 0 100 25">
        <path d="M 5 5 L 95 5 L 95 20 L 30 20 Z" fill="#90ee90" stroke="#2c3e50" strokeWidth="2" />
        <text x="60" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">L-CUT</text>
      </svg>
    )
  }
];

export const TilePalette = () => {
  const handleDragStart = (e, tile) => {
    // Only send serializable data (exclude the svg React element)
    const tileData = {
      title: tile.title,
      code: tile.code,
      width: tile.width,
      height: tile.height,
      cutType: tile.cutType
    };
    e.dataTransfer.setData('tile', JSON.stringify(tileData));
  };

  return (
    <div className="tile-palette">
      <h3>Available Tiles</h3>
      {tiles.map((tile, index) => (
        <div key={index} className="palette-section">
          <h4>{tile.title}</h4>
          <p className="tile-subtitle">{tile.code}</p>
          <div 
            className="palette-tile" 
            draggable="true"
            onDragStart={(e) => handleDragStart(e, tile)}
          >
            {tile.svg}
          </div>
        </div>
      ))}
    </div>
  );
};
