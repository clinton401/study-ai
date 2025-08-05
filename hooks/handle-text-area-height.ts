import {useRef} from 'react'

const handleTextAreaHeight = () => {
    
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const handleInput = () => {
    if (!textareaRef || !textareaRef?.current ) return null;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight - 24}px`;
  };
  return {textareaRef, handleInput}
}

export default handleTextAreaHeight