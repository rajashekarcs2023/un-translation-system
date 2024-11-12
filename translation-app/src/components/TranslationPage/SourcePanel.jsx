import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { TextArea } from '../shared/TextArea';
import { colors } from '../../utils/constants';

export const SourcePanel = ({
  width,
  sourceText,
  setSourceText,
  handleFileUpload,
  fileName
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      className="border-r border-neutral-200 flex flex-col bg-neutral-50"
      style={{ 
        width: `${width}%`,
        minWidth: '15%',
        maxWidth: '70%'
      }}
    >
      <div className="p-4 border-b border-neutral-200 bg-white flex justify-between items-center">
        <h2 className="text-xl text-secondary m-0">Original Text</h2>
        
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white 
                     rounded-md cursor-pointer text-sm transition-colors"
          >
            <Upload size={16} />
            Upload File
          </label>
        </div>
      </div>

      <div 
        className="p-4 flex-1 overflow-hidden flex flex-col"
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
          <div className="mb-4 p-2 bg-neutral-50 rounded-md text-sm flex items-center gap-2">
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

        <TextArea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={isDragging ? 'Drop your file here' : 'Enter or paste your text here, or drop a file'}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
};