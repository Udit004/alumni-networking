import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-indigo-600 text-white py-1 mt-auto" style={{width: '100%' }}>
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} Alumni Network. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 