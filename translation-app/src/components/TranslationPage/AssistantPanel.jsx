import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { colors } from '../../utils/constants';

export const AssistantPanel = ({
  width,
  chatMessages,
  onSendMessage
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    onSendMessage(prompt);
    setPrompt('');
  };

  return (
    <div 
      className="flex flex-col bg-white"
      style={{ 
        width: `${width}%`,
        minWidth: '15%',
        maxWidth: '70%'
      }}
    >
      <div className="p-4 border-b border-neutral-200">
        <h2 className="m-0">AI Assistant</h2>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`
              max-w-[80%] p-3 rounded-xl
              ${message.role === 'user' 
                ? 'ml-auto bg-primary text-white' 
                : 'mr-auto bg-[#f3f4f6] text-black'}
            `}
          >
            {message.role === 'assistant' && message.suggestions ? (
              <div>
                <p className="mb-2">Suggestions for improvement:</p>
                {message.suggestions.map((suggestion, sugIndex) => (
                  <div
                    key={sugIndex}
                    className="p-2 my-1 bg-white rounded-md cursor-pointer border
                             border-neutral-200 hover:bg-[#E6F4FA] 
                             hover:border-primary transition-all
                             flex justify-between items-center"
                    onClick={() => {
                      // Handle suggestion click if needed
                    }}
                  >
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            ) : (
              message.content
            )}
          </div>
        ))}
      </div>

      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-neutral-200 bg-white"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me anything about the translation..."
            className="flex-1 px-3 py-2 border border-neutral-200 rounded-md
                     outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="p-3 bg-primary text-white rounded-md disabled:opacity-50
                     disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};