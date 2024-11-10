import React, { useState, useRef, useEffect } from 'react';
import { Send, Edit2, Check, X, Wand2 } from 'lucide-react';

function TranslationPage() {
  // All state variables
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you improve your translation.' }
  ]);
  const [editedText, setEditedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [selectedTextRange, setSelectedTextRange] = useState({ start: 0, end: 0 });
  const [selectedTranslatedText, setSelectedTranslatedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hoveringSuggestion, setHoveringSuggestion] = useState(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  
  
  const [tempModifiedRanges, setTempModifiedRanges] = useState([]);
 const [showSaveButton, setShowSaveButton] = useState(false);

  // Refs
  const textRef = useRef(null);
  const leftResizeRef = useRef(null);
  const rightResizeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const currentResizerRef = useRef(null);

  // UN Languages
  const unLanguages = [
    'Arabic',
    'Chinese',
    'French',
    'Russian',
    'Spanish'
  ];

  // Panel size states
  const [leftWidth, setLeftWidth] = useState(33);
  const [rightWidth, setRightWidth] = useState(33);
  const middleWidth = 100 - leftWidth - rightWidth;

  // Click outside handler for floating toolbar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (textRef.current && !textRef.current.contains(e.target)) {
        setShowFloatingToolbar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Text selection handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && textRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
  
      // Calculate selection range
      const start = getTextOffset(textRef.current, range.startContainer, range.startOffset);
      const end = start + selectedText.length;
  
      // Update selection states
      setSelectedTextRange({ start, end });
      setSelectedTranslatedText(selectedText);
  
      // Show floating toolbar
      setToolbarPosition({
        top: rect.top - containerRect.top - 40,
        left: rect.left + (rect.width / 2) - containerRect.left
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
      setSelectedTranslatedText('');
      setSelectedTextRange({ start: 0, end: 0 });
    }
  };
  // Add these states at the top


// Add this component for the save button
const SaveButton = () => showSaveButton && (
  <button
    onClick={() => {
      setTempModifiedRanges([]); // Only clear tempModifiedRanges
      setShowSaveButton(false);
    }}
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#22c55e',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      zIndex: 1000
    }}
  >
    Save Changes
  </button>
);
  // Helper function for text offset calculation
  const getTextOffset = (rootNode, targetNode, targetOffset) => {
    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let offset = 0;
    let node;
    while ((node = walker.nextNode())) {
      if (node === targetNode) {
        return offset + targetOffset;
      }
      offset += node.textContent.length;
    }
    return offset;
  };

  // Resize handlers
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
      const newLeftWidth = Math.max(15, Math.min(70, newPosition));
      setLeftWidth(newLeftWidth);
    } else if (currentResizerRef.current === 'right') {
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
  // Handle translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    setEditedText('');
    setTempModifiedRanges([]); 
    // Reset modification tracking
    try {
      const response = await fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          source_language: 'English',
          target_language: selectedLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translated_text);
      setEditedText(data.translated_text);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle AI improvements
  const handleImproveWithAI = async () => {
    if (!selectedTranslatedText) return;
    
    setIsImproving(true);
    try {
      const response = await fetch('http://localhost:8000/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: sourceText,
          translatedText: translatedText,
          selectedText: selectedTranslatedText,
          targetLanguage: selectedLanguage
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get improvements');
      }
  
      const data = await response.json();
      // Clean up suggestions by removing numbering
      const cleanSuggestions = data.suggestions.map(suggestion => 
        suggestion.replace(/^\d+\.\s*/, '').trim()
      );
      
      setChatMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Suggestions for "${selectedTranslatedText}":`,
          suggestions: cleanSuggestions
        }
      ]);
    } catch (error) {
      console.error('Improvement error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  // Handle suggestion application
  

         

  // Handle editing save
  const handleSaveEdit = () => {
    const before = translatedText.substring(0, selectedTextRange.start);
    const after = translatedText.substring(selectedTextRange.end);
    const newText = before + editedText + after;
    
    setTranslatedText(newText);
    setTempModifiedRanges(prev => [...prev, {
      start: selectedTextRange.start,
      end: selectedTextRange.start + editedText.length,
      type: 'edit'
    }]);
    setShowSaveButton(true);
    
    setIsEditing(false);
    setSelectedTranslatedText('');
    setSelectedTextRange({ start: 0, end: 0 });
  };

  // Floating Toolbar Component
  const FloatingToolbar = () => showFloatingToolbar && (
    <div style={{
      position: 'absolute',
      top: `${toolbarPosition.top}px`,
      left: `${toolbarPosition.left}px`,
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 1000
    }}>
      <button
        onClick={() => {
          setEditedText(selectedTranslatedText); // Set the text to edit
          setIsEditing(true); // Show the edit modal
          setShowFloatingToolbar(false); // Hide the toolbar
        }}
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          cursor: 'pointer'
        }}
      >
        <Edit2 size={14} />
        Edit
      </button>
    </div>
  );
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
          transition: 'background-color 0.2s'
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
        {/* Header with Language Selection */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#666', fontSize: '0.875rem' }}>
                From: English
              </span>
              <span style={{ color: '#666', fontSize: '1.2rem', margin: '0 0.5rem' }}>→</span>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              >
                {unLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              style={{
                backgroundColor: isTranslating ? '#93c5fd' : '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: isTranslating ? 'not-allowed' : 'pointer',
                opacity: !sourceText.trim() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '100px',
                justifyContent: 'center'
              }}
            >
              {isTranslating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Translating...
                </>
              ) : (
                'Translate'
              )}
            </button>
          </div>
        </div>

        {/* Translation Content Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '1rem' }}>
            {/* Modified Ranges Legend */}
            {tempModifiedRanges.length > 0 && (
              <div style={{ 
                padding: '0.5rem', 
                display: 'flex', 
                gap: '1rem',
                fontSize: '0.875rem',
                color: '#666',
                marginBottom: '0.5rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'rgba(147, 197, 253, 0.3)',
                    borderRadius: '2px'
                  }} />
                  AI Suggestions
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'rgba(110, 231, 183, 0.3)',
                    borderRadius: '2px'
                  }} />
                  Manual Edits
                </span>
              </div>
            )}

            {/* Translation Text Display */}
            <div 
              ref={textRef}
              style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                minHeight: '100px',
                position: 'relative',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
              onMouseUp={handleTextSelection}
            >
              {translatedText.split('').map((char, index) => {
    const modifiedRange = tempModifiedRanges.find(
      range => index >= range.start && index < range.end
    );
    
    return (
      <span
        key={index}
        style={{
          backgroundColor: modifiedRange 
            ? modifiedRange.type === 'suggestion' 
              ? 'rgba(147, 197, 253, 0.3)' // Light blue for suggestions
              : 'rgba(110, 231, 183, 0.3)'  // Light green for edits
            : 'transparent',
          padding: modifiedRange ? '0.1rem 0' : '0'
        }}
                  >
                    {char}
                  </span>
                );
              })}
              <FloatingToolbar />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            justifyContent: 'space-between' 
          }}>
            <button 
              onClick={handleImproveWithAI}
              disabled={!selectedTranslatedText || isImproving}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                cursor: !selectedTranslatedText || isImproving ? 'not-allowed' : 'pointer',
                opacity: !selectedTranslatedText || isImproving ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isImproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                  Improving...
                </>
              ) : (
                'Improve with AI'
              )}
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
          transition: 'background-color 0.2s'
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
              {message.role === 'assistant' && message.suggestions ? (
                <div>
                  <p style={{ marginBottom: '0.5rem' }}>Suggestions for improvement:</p>
                  {message.suggestions.map((suggestion, sugIndex) => (
  <div
    key={sugIndex}
    onMouseEnter={() => setHoveringSuggestion(sugIndex)}
    onMouseLeave={() => setHoveringSuggestion(null)}
    onClick={() => {
      if (!selectedTranslatedText || selectedTextRange.start === selectedTextRange.end) {
        return;
      }

      const textBefore = translatedText.substring(0, selectedTextRange.start);
      const textAfter = translatedText.substring(selectedTextRange.end);
      const newText = textBefore + suggestion + textAfter;
      
      setTranslatedText(newText);
      setTempModifiedRanges(prev => [...prev, {
        start: selectedTextRange.start,
        end: selectedTextRange.start + suggestion.length,
        type: 'suggestion'
      }]);
      setShowSaveButton(true);

      setSelectedTranslatedText('');
      setSelectedTextRange({ start: 0, end: 0 });
    }}
                      style={{
                        padding: '0.5rem',
                        margin: '0.25rem 0',
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{suggestion}</span>
                      {hoveringSuggestion === sugIndex && (
                        <span style={{ 
                          color: '#22c55e', 
                          marginLeft: '0.5rem',
                          fontSize: '1.25rem' 
                        }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                message.content
              )}
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

      {/* Edit Modal */}
      {/* Edit Modal */}
{isEditing && (
  <div style={{ 
    position: 'fixed', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    width: '90%',
    maxWidth: '500px'
  }}>
    <textarea
      value={editedText}
      onChange={(e) => setEditedText(e.target.value)}
      autoFocus // Add this to focus the textarea when modal opens
      style={{
        width: '100%',
        minHeight: '100px',
        padding: '0.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        marginBottom: '1rem'
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
      <button
        onClick={handleSaveEdit}
        style={{
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        <Check size={16} />
        Save
      </button>
      <button
        onClick={() => {
          setIsEditing(false); // Close the modal
          setEditedText(''); // Clear the edited text
          setShowFloatingToolbar(false); // Hide the toolbar
        }}
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        <X size={16} />
        Cancel
      </button>
    </div>
  </div>
)}
    
      <SaveButton />
    </div>
  );
}

export default TranslationPage;