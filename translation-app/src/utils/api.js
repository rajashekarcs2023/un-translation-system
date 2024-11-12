export const translateText = async (text, targetLanguage) => {
    const response = await fetch('http://localhost:8000/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source_language: 'English',
        target_language: targetLanguage
      }),
    });
  
    if (!response.ok) throw new Error('Translation failed');
    return response.json();
  };
  
  export const improveTranslation = async (params) => {
    const response = await fetch('http://localhost:8000/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  
    if (!response.ok) throw new Error('Failed to get improvements');
    return response.json();
  };
  
  export const highlightTerms = async (text) => {
    const response = await fetch('http://localhost:8000/api/highlight-terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  
    if (!response.ok) throw new Error('Failed to highlight terms');
    return response.json();
  };