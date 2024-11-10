import React from 'react';
import { MessageSquare } from 'lucide-react';

function AIAssistantPanel({ selectedTerm, sourceLanguage, targetLanguage }) {
  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare size={20} />
          AI Assistant
        </h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {selectedTerm ? (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Selected term:</p>
              <p className="font-medium text-lg">{selectedTerm}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Translation Suggestions</h3>
                <ul className="space-y-2">
                  <li className="bg-white p-2 rounded cursor-pointer hover:bg-purple-100">
                    Suggestion 1
                  </li>
                  <li className="bg-white p-2 rounded cursor-pointer hover:bg-purple-100">
                    Suggestion 2
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Context Examples</h3>
                <p className="text-sm text-gray-600">
                  Example usage in similar contexts...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            Select a technical term or ask for translation improvements
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAssistantPanel;