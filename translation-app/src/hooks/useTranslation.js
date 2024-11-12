import { useState } from 'react';
import { translateText, improveTranslation, highlightTerms } from '../utils/api';

export const useTranslation = () => {
  // State
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you improve your translation.' }
  ]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedTranslatedText, setSelectedTranslatedText] = useState('');
  const [selectedTextRange, setSelectedTextRange] = useState({ start: 0, end: 0 });
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [tempModifiedRanges, setTempModifiedRanges] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');

  // Handlers
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    try {
      const data = await translateText(sourceText, selectedLanguage);
      setTranslatedText(data.translated_text);
      setHighlightedText('');
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!selectedTranslatedText) return;
    
    setIsImproving(true);
    try {
      const data = await improveTranslation({
        originalText: sourceText,
        translatedText,
        selectedText: selectedTranslatedText,
        targetLanguage: selectedLanguage
      });
      
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Suggestions for "${selectedTranslatedText}":`,
          suggestions: data.suggestions.map(s => s.replace(/^\d+\.\s*/, '').trim())
        }
      ]);
    } catch (error) {
      console.error('Improvement error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleHighlight = async () => {
    if (!translatedText) return;
    
    setIsTranslating(true);
    try {
      const data = await highlightTerms(translatedText);
      setHighlightedText(data.highlighted_text);
    } catch (error) {
      console.error('Highlight error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setFileName(file.name);
    
    try {
      if (file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch('http://localhost:8000/api/upload-pdf', {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) throw new Error('Failed to upload PDF');
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setSourceText(data.text);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => setSourceText(e.target.result);
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file: ' + error.message);
    }
  };

  const handleTextSelection = (textRef) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && textRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
  
      const start = getTextOffset(textRef.current, range.startContainer, range.startOffset);
      const end = start + selectedText.length;
  
      setSelectedTextRange({ start, end });
      setSelectedTranslatedText(selectedText);
  
      setToolbarPosition({
        top: rect.top - containerRect.top - 40,
        left: rect.left + (rect.width / 2) - containerRect.left
      });
      setShowFloatingToolbar(true);
    }
  };

  return {
    // State
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
    
    // Setters
    setSourceText,
    setTranslatedText,
    setSelectedLanguage,
    setChatMessages,
    setShowFloatingToolbar,
    setTempModifiedRanges,
    setShowSaveButton,
    
    // Handlers
    handleTranslate,
    handleImproveWithAI,
    handleHighlight,
    handleFileUpload,
    handleTextSelection,
  };
};