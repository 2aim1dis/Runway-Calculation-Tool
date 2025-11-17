import { useMemo } from 'react';
import { useRunway } from '../context/RunwayContext';
import './InventoryPanel.css';

const tilePrices = {
  'Tile 1m × 1m': 61.20,
  'Tile 1m × 0.5m': 32.00,
  'Cut tile Left': 80.00,
  'Cut tile Right': 80.00,
  'Ramp Cut Left': 28.00,
  'Ramp Cut Right': 28.00,
  'Ramp Corner': 52.00,
  'Ramp 1m': 26.00,
  'Ramp 0.5m': 14.00,
  '3D Deltas precut tiles': 160.00  // Sum of Cut tile Left (80) + Cut tile Right (80)
};

export const InventoryPanel = () => {
  const { inventory } = useRunway();

  const inventoryData = useMemo(() => {
    const data = Object.entries(inventory).map(([type, count]) => ({
      type,
      count,
      price: tilePrices[type] || 0,
      total: count * (tilePrices[type] || 0)
    }));

    // Always include "3D Deltas precut tiles" as first row
    const runwayPrice = tilePrices['3D Deltas precut tiles'] || 0;
    const runwayRow = {
      type: '3D Deltas precut tiles',
      count: 1,
      price: runwayPrice,
      total: runwayPrice
    };

    // Combine runway row with other tiles
    const allData = [runwayRow, ...data];

    const totalCount = allData.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = allData.reduce((sum, item) => sum + item.total, 0);

    return { data: allData, totalCount, totalPrice };
  }, [inventory]);

  const handleExportExcel = () => {
    // Create CSV content
    const csvContent = [
      ['Tile Type', 'Quantity', 'Unit Price (€)', 'Total (€)'],
      ...inventoryData.data.map(item => [item.type, item.count, item.price, item.total]),
      ['Total', inventoryData.totalCount, '', inventoryData.totalPrice]
    ].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'runway-inventory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="inventory-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3>Inventory</h3>
        <button className="export-excel-btn" onClick={handleExportExcel} title="Export to Excel">
          📊
        </button>
      </div>
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Tile Type</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.data.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No tiles placed yet
                </td>
              </tr>
            ) : (
              <>
                {inventoryData.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.type}</td>
                    <td className="count-cell">{item.count}</td>
                    <td className="price-cell">€{item.price}</td>
                    <td className="price-cell">€{item.total}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td className="count-cell"><strong>{inventoryData.totalCount}</strong></td>
                  <td></td>
                  <td className="price-cell"><strong>€{inventoryData.totalPrice}</strong></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
