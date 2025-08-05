import { useRef } from 'react'

const handleTextAreaHeight = () => {
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  
  const handleInput = () => {
    if (!textareaRef || !textareaRef?.current) return null;
    
    const textarea = textareaRef.current;
    
    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto";
    
    // Use setTimeout to ensure the DOM has updated with the new content
    // setTimeout(() => {
      if (textarea) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    // }, 0);
  };
  
  return { textareaRef, handleInput }
}

export default handleTextAreaHeight