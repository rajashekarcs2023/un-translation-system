import React, { useState } from 'react';
import OriginalTextPanel from './OriginalTextPanel';
import TranslationPanel from './TranslationPanel';
import AIAssistantPanel from './AIAssistantPanel';

function TranslationInterface({ documentText }) {
  const [highlightTerms, setHighlightTerms] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('fr');

  const technicalTerms = [
    'land degradation',
    'agricultural productivity',
    'sustainable development',
    'climate change',
    'biodiversity',
    'ecosystem services'
  ];

  const handleTranslate = () => {
    // In a real app, this would call your translation API
    setTranslatedText("Translated version of the text would appear here...");
  };

  const handleTermSelect = (term) => {
    setSelectedTerm(term);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-3 gap-4 p-4">
        <OriginalTextPanel 
          text={documentText}
          highlightTerms={highlightTerms}
          technicalTerms={technicalTerms}
          onTermSelect={handleTermSelect}
        />
        
        <TranslationPanel 
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onLanguageChange={(source, target) => {
            setSourceLanguage(source);
            setTargetLanguage(target);
          }}
          onTranslate={handleTranslate}
          onHighlightToggle={() => setHighlightTerms(!highlightTerms)}
          highlightTerms={highlightTerms}
          translatedText={translatedText}
        />
        
        <AIAssistantPanel 
          selectedTerm={selectedTerm}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />
      </div>
    </div>
  );
}

export default TranslationInterface;