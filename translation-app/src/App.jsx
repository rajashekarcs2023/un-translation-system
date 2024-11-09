import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import TranslationInterface from './components/TranslationInterface';

export default function App() {
  const [isWorking, setIsWorking] = useState(false);

  return (
    
      {!isWorking ? (
        <DocumentUpload onStartWorking={() => setIsWorking(true)} />
      ) : (
        
      )}
    
  );
}