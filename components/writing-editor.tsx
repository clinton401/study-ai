"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MarkdownIt from "markdown-it";

// Dynamically import so it only runs on the client
const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt();

export  function WritingEditor() {
  const [content, setContent] = useState("");

  const handleEditorChange = ({ html, text }: { html: string; text: string }) => {
    console.log("HTML output:", html);
    console.log("Markdown text:", text);
    setContent(text);
  };

  return (
    <div className=" bg-card mx-auto p-4">
      <MdEditor
        value={content}
        style={{ height: "500px" }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
    </div>
  );
}
