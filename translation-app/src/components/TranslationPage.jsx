import React, { useState, useRef, useEffect } from 'react';
import { Send, Edit2, Upload, Check, X, Wand2,Highlighter  } from 'lucide-react';

// Add this colors object right after the imports
const colors = {
  primary: '#009EDB', // UN Blue
  secondary: '#1A365D', // Darker blue for headers
  accent: '#00B398', // UN Teal
  neutral: {
    light: '#F8FAFC',
    medium: '#E2E8F0',
    dark: '#475569'
  }
};

function TranslationPage() {
  // All state variables
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you improve your translation.' }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  // Add or verify these state declarations
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [selectedTranslatedText, setSelectedTranslatedText] = useState('');
  const [selectedTextRange, setSelectedTextRange] = useState({ start: 0, end: 0 });
  const [hoveringSuggestion, setHoveringSuggestion] = useState(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  
  
  const [tempModifiedRanges, setTempModifiedRanges] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  // Add these near your other state variables
  // Add this with your other state variables at the top
  const [highlightedText, setHighlightedText] = useState('');
  const [isHighlighting, setIsHighlighting] = useState(false);
  // Add after your state declarations and before handlers
const renderText = () => {
  if (!highlightedText) {
    // Show normal text with modifications
    return translatedText.split('').map((char, index) => {
      const modifiedRange = tempModifiedRanges.find(
        range => index >= range.start && index < range.end
      );
      
      return (
        <span
          key={index}
          style={{
            backgroundColor: modifiedRange 
              ? modifiedRange.type === 'suggestion' 
                ? 'rgba(147, 112, 219, 0.3)'
                : 'rgba(110, 231, 183, 0.3)'
              : 'transparent',
            padding: modifiedRange ? '0.1rem 0' : '0'
          }}
        >
          {char}
        </span>
      );
    });
  }

  // Show highlighted text
  return highlightedText.split(/(\[\[.*?\]\])/g).map((part, index) => {
    if (part.startsWith('[[') && part.endsWith(']]')) {
      // This is a technical term
      return (
        <span
          key={index}
          style={{
            backgroundColor: 'rgba(255, 255, 0, 0.3)',
            padding: '0 2px',
            borderRadius: '2px'
          }}
        >
          {part.slice(2, -2)} {/* Remove the [[ and ]] */}
        </span>
      );
    }
    // Regular text
    return part;
  });
};
  // Add after your state declarations

  // Add this with your other handler functions
const handleHighlight = async () => {
  if (!translatedText) return;
  
  setIsHighlighting(true);
  try {
    const response = await fetch('http://localhost:8000/api/highlight-terms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: translatedText })
    });

    if (!response.ok) {
      throw new Error('Failed to highlight terms');
    }
    
    const data = await response.json();
    setHighlightedText(data.highlighted_text);
  } catch (error) {
    console.error('Highlight error:', error);
    alert('Failed to highlight terms');
  } finally {
    setIsHighlighting(false);
  }
};
  
  // Add this function to handle term clicks
  const handleTermClick = async (term) => {
    setSelectedTerm(term);
    try {
      const response = await fetch('http://localhost:8000/api/suggest-alternatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term })
      });
  
      if (!response.ok) throw new Error('Failed to get alternatives');
      
      const data = await response.json();
      setAlternatives(data.alternatives);
    } catch (error) {
      console.error('Alternative terms error:', error);
    }
  };
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setFileName(file.name);
    
    try {
      if (file.type === 'application/pdf') {
        // Handle PDF file
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch('http://localhost:8000/api/upload-pdf', {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) {
          throw new Error('Failed to upload PDF');
        }
  
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setSourceText(data.text);
      } else {
        // Handle text files
        const reader = new FileReader();
        reader.onload = (e) => {
          setSourceText(e.target.result);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file: ' + error.message);
    }
  };
const Header = () => (
  <header style={{
    backgroundColor: colors.primary,
    padding: '1rem',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>UN Document Translation</h1>
    </div>
  </header>
);
  // Add this right after your state declarations
  useEffect(() => {
    console.log({
      isEditing,
      editedText,
      selectedTranslatedText,
      showFloatingToolbar
    });
  }, [isEditing, editedText, selectedTranslatedText, showFloatingToolbar]);
  useEffect(() => {
    setHighlightedText(''); // Clear highlights when text changes
  }, [translatedText]);

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
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedTranslatedText);
      setShowCopyNotification(true);
      setShowFloatingToolbar(false);
      
      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  const CopyNotification = () => {
    if (!showCopyNotification) return null;
  
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        Text copied to clipboard!
      </div>
    );
  };
  // Text selection handler
  const handleTextSelection = () => {
    console.log('Text selection triggered');
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    console.log('Selected text:', selectedText);
    
    if (selectedText && textRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
  
      // Calculate selection range
      const start = getTextOffset(textRef.current, range.startContainer, range.startOffset);
      const end = start + selectedText.length;
  
      console.log('Selection range:', { start, end });
  
      // Update selection states
      setSelectedTextRange({ start, end });
      setSelectedTranslatedText(selectedText);
  
      // Show floating toolbar
      setToolbarPosition({
        top: rect.top - containerRect.top - 40,
        left: rect.left + (rect.width / 2) - containerRect.left
      });
      setShowFloatingToolbar(true);
    }
  };


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
  // Add this handler function near your other handlers
const handleSendMessage = async () => {
  if (!prompt.trim()) return;

  const userMessage = { role: 'user', content: prompt };
  setChatMessages(prev => [...prev, userMessage]);
  setPrompt('');

  try {
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        translatedText: translatedText,
        context: chatMessages.slice(-5) // Last 5 messages for context
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: data.message
    }]);

  } catch (error) {
    console.error('Chat error:', error);
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    }]);
  }
};
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

  //
  const FloatingToolbar = () => {
    if (!showFloatingToolbar) return null;
  
    const handleEditClick = () => {
      // Create modal container
      const modalContainer = document.createElement('div');
      modalContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 2000;
        width: 400px;
      `;
  
      // Create textarea
      const textarea = document.createElement('textarea');
      textarea.value = selectedTranslatedText;
      textarea.style.cssText = `
        width: 100%;
        min-height: 100px;
        padding: 8px;
        margin: 10px 0;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
      `;
  
      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      `;
  
      // Create save button
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.style.cssText = `
        padding: 6px 12px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
  
      // Create cancel button
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.style.cssText = `
        padding: 6px 12px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
  
      // Add event listeners
      saveButton.onclick = () => {
        const newText = textarea.value;
        if (newText !== selectedTranslatedText) {
          const textBefore = translatedText.substring(0, selectedTextRange.start);
          const textAfter = translatedText.substring(selectedTextRange.end);
          const updatedText = textBefore + newText + textAfter;
          
          setTranslatedText(updatedText);
          setTempModifiedRanges(prev => [
            ...prev,
            {
              start: selectedTextRange.start,
              end: selectedTextRange.start + newText.length,
              type: 'edit'
            }
          ]);
          setShowSaveButton(true);
        }
        document.body.removeChild(modalContainer);
        setShowFloatingToolbar(false);
      };
  
      cancelButton.onclick = () => {
        document.body.removeChild(modalContainer);
        setShowFloatingToolbar(false);
      };
  
      // Assemble the modal
      buttonsContainer.appendChild(cancelButton);
      buttonsContainer.appendChild(saveButton);
      modalContainer.appendChild(textarea);
      modalContainer.appendChild(buttonsContainer);
  
      // Add modal to body
      document.body.appendChild(modalContainer);
  
      // Focus textarea
      textarea.focus();
    };
    // Add this function before the return statement
    // Add this function before the return statement

  
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
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
          zIndex: 1000,
        }}
      >
        <button
          type="button"
          onClick={handleEditClick}
          className="toolbar-button"
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
  
        <button
          type="button"
          onClick={handleCopy}
          className="toolbar-button"
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
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
      </div>
    );
  };
// Remove handleSaveEdit function as it's no longer needed

// ... rest of the code remains the same ...
return (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header />
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      isolation: 'isolate' 
    }}>
      {/* Left Panel */}
      <div style={{ 
        width: `${leftWidth}%`,
        minWidth: '15%',
        maxWidth: '70%',
        borderRight: `1px solid ${colors.neutral.medium}`,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.neutral.light,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          padding: '1rem', 
          borderBottom: `1px solid ${colors.neutral.medium}`,
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: 0,
            color: colors.secondary,
            fontSize: '1.25rem' 
          }}>Original Text</h2>
          
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              id="file-upload"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="file-upload"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s'
              }}
            >
              <Upload size={16} />
              Upload File
            </label>
          </div>
        </div>

        <div 
          style={{ 
            padding: '1rem', 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            handleFileUpload(file);
          }}
        >
          {fileName && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: colors.neutral.light,
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {fileName}
            </div>
          )}

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={isDragging ? 'Drop your file here' : 'Enter or paste your text here, or drop a file'}
            style={{
              width: '100%',
              height: '100%',
              padding: '1rem',
              border: `2px dashed ${isDragging ? colors.primary : '#e5e7eb'}`,
              borderRadius: '0.375rem',
              resize: 'none',
              fontSize: '1rem',
              lineHeight: '1.5',
              overflowY: 'auto',
              backgroundColor: isDragging ? colors.neutral.light : 'white',
              transition: 'all 0.2s'
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
                  border: `1px solid ${colors.neutral.medium}`,
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: colors.secondary,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  outline: 'none'
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
                flex: 1,
                padding: '0.5rem',
                backgroundColor: colors.primary, // UN Blue
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: !sourceText || isTranslating ? 'not-allowed' : 'pointer',
                opacity: !sourceText || isTranslating ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
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
                    backgroundColor: 'rgba(147, 112, 219, 0.3)',
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
    wordBreak: 'break-word',
    userSelect: 'text',
    cursor: 'text',
    lineHeight: '1.5'
  }}
  onMouseUp={handleTextSelection}
  onBlur={(e) => {
    if (!e.relatedTarget?.closest('.toolbar-button')) {
      setTimeout(() => setShowFloatingToolbar(false), 200);
    }
  }}
>
  {isEditing ? (
    <textarea
      value={editedText}
      onChange={(e) => setEditedText(e.target.value)}
      style={{
        width: '100%',
        height: '100%',
        padding: '0',
        border: 'none',
        backgroundColor: 'transparent',
        resize: 'none',
        outline: 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit'
      }}
      autoFocus
    />
  ) : (
    renderText()
  )}
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
            
<button 
  onClick={handleHighlight}  // Add this onClick handler
  disabled={!translatedText || isTranslating}  // Add this disabled state
  style={{
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    cursor: !translatedText || isTranslating ? 'not-allowed' : 'pointer',
    opacity: !translatedText || isTranslating ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  }}
>
  {isTranslating ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
      Highlighting...
    </>
  ) : (
    <>
      <Highlighter size={16} />
      Highlight Terms
    </>
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
              Export
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
                        alignItems: 'center',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                        backgroundColor: hoveringSuggestion === sugIndex ? '#E6F4FA' : 'white', // Light purple on hover
                        borderColor: hoveringSuggestion === sugIndex ? colors.primary : '#e5e7eb', // Purple border on hover
                      }}
                    >
                      <span>{suggestion}</span>
                      {hoveringSuggestion === sugIndex && (
                        <span style={{ 
                          color: colors.primary,  // Purple checkmark
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      }}
      placeholder="Ask me anything about the translation..."
      style={{
        flex: 1,
        padding: '0.75rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        outline: 'none',
        ':focus': {
          borderColor: colors.primary
        }
      }}
            />
            <button
            onClick={handleSendMessage}  
            disabled={!prompt.trim()}
              style={{
                padding: '0.75rem',
                backgroundColor: colors.primary, // UN Blue
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: '#0082B3' // Slightly darker blue on hover
                }
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

    


    
      <SaveButton />
      </div>
    </div>
  );
}

export default TranslationPage;