"use client";

import { useState, ChangeEvent } from "react";

export function WritingEditor() {
  const [content, setContent] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Keeping track for debugging as you did before
    console.log("Current Content:", text);
    setContent(text);
  };

  return (
    <div className="bg-card mx-auto p-4 w-full">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start writing your summary or notes here..."
        className="w-full h-[500px] p-4 text-sm font-sans bg-background border border-input rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent 
                   resize-none transition-all duration-200"
      />
      <div className="mt-2 text-xs text-muted-foreground text-right">
        Character count: {content.length}
      </div>
    </div>
  );
}