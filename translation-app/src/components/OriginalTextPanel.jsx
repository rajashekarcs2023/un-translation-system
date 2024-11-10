import React from 'react';

function OriginalTextPanel({ text, highlightTerms, technicalTerms, onTermSelect }) {
  const highlightText = (text) => {
    if (!highlightTerms) return text;
    
    let highlightedText = text;
    technicalTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<span class="bg-yellow-100 cursor-pointer hover:bg-yellow-200 px-1 rounded" data-term="$1">$1</span>`
      );
    });
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: highlightedText }}
        onClick={(e) => {
          const term = e.target.getAttribute('data-term');
          if (term) onTermSelect(term);
        }}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Original Text</h2>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
        <div className="prose max-w-none">
          {highlightText(text)}
        </div>
      </div>
    </div>
  );
}

export default OriginalTextPanel;