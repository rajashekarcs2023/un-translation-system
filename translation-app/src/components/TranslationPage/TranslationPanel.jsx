// src/components/TranslationPage/TranslationPanel.jsx
import React, { useState } from 'react';
import { Send, Edit2, Upload, Check, X, Wand2, Highlighter } from 'lucide-react';
import { Button } from '../shared/Button';
import { UN_LANGUAGES, colors } from '../../utils/constants';

const FloatingToolbar = ({
  show,
  position,
  onEdit,
  onCopy,
}) => {
  if (!show) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bg-white p-2 rounded-md shadow-md flex gap-2 z-20"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        onClick={onEdit}
        className="p-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded 
                 flex items-center gap-1 text-sm hover:bg-[#e5e7eb]"
      >
        <Edit2 size={14} />
        Edit
      </button>

      <button
        onClick={onCopy}
        className="p-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded 
                 flex items-center gap-1 text-sm hover:bg-[#e5e7eb]"
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

export const TranslationPanel = ({
  width,
  translatedText,
  selectedLanguage,
  isTranslating,
  isImproving,
  selectedTranslatedText,
  showFloatingToolbar,
  toolbarPosition,
  tempModifiedRanges,
  highlightedText,
  textRef,
  setSelectedLanguage,
  handleTranslate,
  handleImproveWithAI,
  handleHighlight,
  handleTextSelection,
  setShowFloatingToolbar,
  setTempModifiedRanges,
  setShowSaveButton,
  setTranslatedText, // Added missing prop
}) => {
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedTranslatedText);
      setShowCopyNotification(true);
      setShowFloatingToolbar(false);
      
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEdit = () => {
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

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
    `;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.cssText = `
      padding: 6px 12px;
      background: ${colors.primary};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
      padding: 6px 12px;
      background: ${colors.primary};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;

    saveButton.onclick = () => {
      const newText = textarea.value;
      if (newText !== selectedTranslatedText) {
        // Get the text before and after the selected range
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

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    modalContainer.appendChild(textarea);
    modalContainer.appendChild(buttonsContainer);

    document.body.appendChild(modalContainer);
    textarea.focus();
  };

  const renderText = () => {
    if (!highlightedText) {
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

    return highlightedText.split(/(\[\[.*?\]\])/g).map((part, index) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        return (
          <span
            key={index}
            className="bg-yellow-200/30 px-0.5 rounded"
          >
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className="flex flex-col bg-white"
      style={{ width: `${width}%`, minWidth: '20%' }}
    >
      {/* Header with Language Selection */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex gap-4 items-center">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-gray-600 text-sm">From: English</span>
            <span className="text-gray-600 text-xl mx-2">→</span>
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="flex-1 p-2 border border-neutral-200 rounded-md 
                       bg-white text-secondary text-sm cursor-pointer outline-none"
            >
              {UN_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex-1"
          >
            {isTranslating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </Button>
        </div>
      </div>

      {/* Translation Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {tempModifiedRanges.length > 0 && (
            <div className="p-2 flex gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-300/30 rounded" />
                AI Suggestions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-300/30 rounded" />
                Manual Edits
              </span>
            </div>
          )}

          {/* Translation Text Display */}
          <div 
            ref={textRef}
            className="p-4 bg-gray-50 rounded-md min-h-[100px] relative whitespace-pre-wrap 
                     break-words select-text cursor-text leading-relaxed"
            onMouseUp={handleTextSelection}
            onBlur={(e) => {
              if (!e.relatedTarget?.closest('.toolbar-button')) {
                setTimeout(() => setShowFloatingToolbar(false), 200);
              }
            }}
          >
            {renderText()}
            <FloatingToolbar
              show={showFloatingToolbar}
              position={toolbarPosition}
              onEdit={handleEdit}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex gap-2 justify-between">
          <Button
            variant="secondary"
            onClick={handleImproveWithAI}
            disabled={!selectedTranslatedText || isImproving}
            className="flex-1"
          >
            {isImproving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                Improving...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Improve with AI
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={handleHighlight}
            disabled={!translatedText || isTranslating}
            className="flex-1"
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
          </Button>

          <Button
            variant="secondary"
            className="flex-1"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 
                       rounded-md shadow-md z-20 animate-fade-in">
          Text copied to clipboard!
        </div>
      )}
    </div>
  );
};