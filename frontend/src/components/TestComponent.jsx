import React from 'react'

const TestComponent = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>MFI Portal Test</h1>
      <p>If you can see this, React is working!</p>
      <button 
        onClick={() => alert('React is working!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  )
}

export default TestComponent


