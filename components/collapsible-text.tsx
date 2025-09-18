import  { useState, FC } from "react";

interface CollapsibleTextProps {
  text: string;
  maxChars?: number;  
  className?: string;    
}

export const CollapsibleText: FC<CollapsibleTextProps> = ({
  text,
  maxChars = 150,
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxChars) {
    return <p className={className}>{text}</p>;
  }

  const preview = text.slice(0, maxChars).trim();

  return (
    <div className={className}>
      <p className="inline">
        {expanded ? text : `${preview}…`}
      </p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-blue-600 hover:underline focus:outline-none"
      >
        {expanded ? "See less" : "See more"}
      </button>
    </div>
  );
};

