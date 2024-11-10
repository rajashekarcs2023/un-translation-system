import { useState } from 'react';
import { Upload } from 'lucide-react';

function UploadPage({ onNext }) {
  const [file, setFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Upload your document
            </h3>
            <p className="mt-2 text-gray-500">PDF files only</p>
            
            <div className="mt-6">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Browse Files
              </label>
            </div>

            {file && (
              <p className="mt-4 text-sm text-gray-500">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onNext("Sample text for translation")} // In real app, you'd process the PDF here
          className={`mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors
            ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!file}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UploadPage;