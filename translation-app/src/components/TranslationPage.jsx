import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

function TranslationPage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you improve your translation.' }
  ]);

  // Panel size states (in percentages)
  const [leftWidth, setLeftWidth] = useState(33);
  const [rightWidth, setRightWidth] = useState(33);

  // Refs for resize handling
  const leftResizeRef = useRef(null);
  const rightResizeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const currentResizerRef = useRef(null);

  const handleMouseDown = (e, resizer) => {
    isDraggingRef.current = true;
    currentResizerRef.current = resizer;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const containerWidth = window.innerWidth;
    const newPosition = (e.clientX / containerWidth) * 100;

    if (currentResizerRef.current === 'left') {
      // Ensure left panel stays between 15% and 70% width
      const newLeftWidth = Math.max(15, Math.min(70, newPosition));
      setLeftWidth(newLeftWidth);
    } else if (currentResizerRef.current === 'right') {
      // Calculate right panel width from the right edge
      const newRightWidth = Math.max(15, Math.min(70, 100 - newPosition));
      setRightWidth(newRightWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    currentResizerRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Calculate middle panel width
  const middleWidth = 100 - leftWidth - rightWidth;

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Left Panel */}
      <div style={{ 
        width: `${leftWidth}%`,
        minWidth: '15%',
        maxWidth: '70%',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Original Text</h2>
        </div>
        <div style={{ padding: '1rem', flex: 1, overflow: 'hidden' }}>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste or type your text here..."
            style={{
              width: '100%',
              height: '100%',
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              resize: 'none',
              fontSize: '1rem',
              lineHeight: '1.5',
              overflowY: 'auto'
            }}
          />
        </div>
      </div>

      {/* Left Resize Handle */}
      <div
        ref={leftResizeRef}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
        style={{
          width: '5px',
          cursor: 'col-resize',
          backgroundColor: '#f3f4f6',
          position: 'relative',
          zIndex: 10,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: '#e5e7eb'
          }
        }}
      />

      {/* Middle Panel */}
      <div style={{ 
        width: `${middleWidth}%`,
        minWidth: '20%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select style={{ 
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }}>
              <option>English → French</option>
              <option>English → Spanish</option>
              <option>English → Arabic</option>
            </select>
            <button style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}>
              Translate
            </button>
          </div>
        </div>
        
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          {translatedText || (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              marginTop: '2rem' 
            }}>
              Translation will appear here
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            justifyContent: 'space-between' 
          }}>
            <button style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              Improve with AI
            </button>
            <button style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              Highlight Terms
            </button>
            <button style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              Glossary
            </button>
          </div>
        </div>
      </div>

      {/* Right Resize Handle */}
      <div
        ref={rightResizeRef}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
        style={{
          width: '5px',
          cursor: 'col-resize',
          backgroundColor: '#f3f4f6',
          position: 'relative',
          zIndex: 10,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: '#e5e7eb'
          }
        }}
      />

      {/* Right Panel */}
      <div style={{ 
        width: `${rightWidth}%`,
        minWidth: '15%',
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0 }}>AI Assistant</h2>
        </div>
        
        <div style={{ 
          padding: '1rem', 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {chatMessages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                backgroundColor: message.role === 'user' ? '#2563eb' : '#f3f4f6',
                color: message.role === 'user' ? 'white' : 'black',
              }}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem' 
          }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me anything about the translation..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
            <button
              style={{
                padding: '0.75rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranslationPage;