import React from 'react';

const Loading = () => {
  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div>
        <div className="spinner"></div>
        <p className="text-center mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
