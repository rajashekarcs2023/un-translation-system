export const colors = {
    primary: '#009EDB', // UN Blue
    secondary: '#1A365D', // Darker blue for headers
    accent: '#00B398', // UN Teal
    neutral: {
      light: '#F8FAFC',
      medium: '#E2E8F0',
      dark: '#475569'
    }
  };
  
  export const UN_LANGUAGES = [
    'Arabic',
    'Chinese',
    'French',
    'Russian',
    'Spanish'
  ];
  
  // Helper function for text selection
  export const getTextOffset = (rootNode, targetNode, targetOffset) => {
    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
  
    let offset = 0;
    let node;
    while ((node = walker.nextNode())) {
      if (node === targetNode) {
        return offset + targetOffset;
      }
      offset += node.textContent.length;
    }
    return offset;
  };