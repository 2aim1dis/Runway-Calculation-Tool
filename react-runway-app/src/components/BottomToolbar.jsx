import './BottomToolbar.css';

export const BottomToolbar = () => {
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            console.log('Uploaded data:', data);
            alert('Layout uploaded successfully!');
          } catch (err) {
            console.error('Failed to upload layout file:', err);
            alert('Error reading file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="bottom-toolbar">
      <span className="version-indicator">v2.0.0-react</span>
      <button className="toolbar-btn" onClick={handleUpload}>
        📁 Upload Layout
      </button>
      <span className="file-status">Ready</span>
    </div>
  );
};
