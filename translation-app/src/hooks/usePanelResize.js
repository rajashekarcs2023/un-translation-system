import { useState, useRef } from 'react';

export const usePanelResize = () => {
  const [leftWidth, setLeftWidth] = useState(33);
  const [rightWidth, setRightWidth] = useState(33);
  const middleWidth = 100 - leftWidth - rightWidth;

  const isDraggingRef = useRef(false);
  const currentResizerRef = useRef(null);

  const handleMouseDown = (e, resizer) => {
    isDraggingRef.current = true;
    currentResizerRef.current = resizer;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const containerWidth = window.innerWidth;
    const newPosition = (e.clientX / containerWidth) * 100;
    
    if (currentResizerRef.current === 'left') {
      const newLeftWidth = Math.max(15, Math.min(70, newPosition));
      setLeftWidth(newLeftWidth);
    } else if (currentResizerRef.current === 'right') {
      const newRightWidth = Math.max(15, Math.min(70, 100 - newPosition));
      setRightWidth(newRightWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    currentResizerRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    leftWidth,
    rightWidth,
    middleWidth,
    handleMouseDown,
  };
};