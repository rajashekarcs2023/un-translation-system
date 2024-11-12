import React, { useRef } from 'react';
import { Send, Highlighter } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { usePanelResize } from '../../hooks/usePanelResize';
import { SourcePanel } from './SourcePanel';
import { TranslationPanel } from './TranslationPanel';
import { AssistantPanel } from './AssistantPanel';
import { colors } from '../../utils/constants';

const Header = () => (
  <header className="bg-[#009EDB] p-4 text-white shadow-sm">
    <div className="flex items-center gap-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">UN Document Translation</h1>
    </div>
  </header>
);

const ResizeHandle = ({ onMouseDown }) => (
  <div
    onMouseDown={onMouseDown}
    className="w-[5px] cursor-col-resize bg-[#f3f4f6] relative z-10 
               hover:bg-[#e5e7eb] transition-colors"
  />
);

const TranslationPage = () => {
  const {
    sourceText,
    translatedText,
    selectedLanguage,
    chatMessages,
    isTranslating,
    isImproving,
    fileName,
    selectedTranslatedText,
    selectedTextRange,
    showFloatingToolbar,
    toolbarPosition,
    tempModifiedRanges,
    showSaveButton,
    highlightedText,
    setSourceText,
    setTranslatedText,
    setSelectedLanguage,
    setChatMessages,
    setShowFloatingToolbar,
    setTempModifiedRanges,
    setShowSaveButton,
    handleTranslate,
    handleImproveWithAI,
    handleHighlight,
    handleFileUpload,
    handleTextSelection,
  } = useTranslation();

  const {
    leftWidth,
    rightWidth,
    middleWidth,
    handleMouseDown,
  } = usePanelResize();

  const textRef = useRef(null);

  // Chat message handler
  const handleSendMessage = async (prompt) => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          translatedText: translatedText,
          context: chatMessages.slice(-5)
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

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

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden relative isolate">
        <SourcePanel
          width={leftWidth}
          sourceText={sourceText}
          setSourceText={setSourceText}
          handleFileUpload={handleFileUpload}
          fileName={fileName}
        />

        <ResizeHandle onMouseDown={(e) => handleMouseDown(e, 'left')} />

        <TranslationPanel
          width={middleWidth}
          translatedText={translatedText}
          selectedLanguage={selectedLanguage}
          isTranslating={isTranslating}
          isImproving={isImproving}
          selectedTranslatedText={selectedTranslatedText}
          showFloatingToolbar={showFloatingToolbar}
          toolbarPosition={toolbarPosition}
          tempModifiedRanges={tempModifiedRanges}
          highlightedText={highlightedText}
          textRef={textRef}
          setSelectedLanguage={setSelectedLanguage}
          handleTranslate={handleTranslate}
          handleImproveWithAI={handleImproveWithAI}
          handleHighlight={handleHighlight}
          handleTextSelection={() => handleTextSelection(textRef)}
          setShowFloatingToolbar={setShowFloatingToolbar}
          setTempModifiedRanges={setTempModifiedRanges}
          setShowSaveButton={setShowSaveButton}
        />

        <ResizeHandle onMouseDown={(e) => handleMouseDown(e, 'right')} />

        <AssistantPanel
          width={rightWidth}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
        />

        {showSaveButton && (
          <button
            onClick={() => {
              setTempModifiedRanges([]);
              setShowSaveButton(false);
            }}
            className="fixed bottom-5 right-5 bg-[#22c55e] text-white px-4 py-2 
                     rounded-md shadow-md z-20"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default TranslationPage;