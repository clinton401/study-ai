import ReactMarkdown from 'react-markdown';

type Props = {
  content: string;
};

export const AIContentDisplay = ({ content }: Props) => {
   function sanitizeMarkdown() {
  return content
    .replace(/^```markdown\s*/i, "") // remove opening ```markdown
    .replace(/^```/, "")             // remove any opening ```
    .replace(/```$/, "");            // remove closing ```
}
  return (
    <ReactMarkdown
      // className="prose-pre:bg-transparent 
      //        prose-blockquote:bg-transparent"
      
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-4xl font-black font-serif my-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-3xl font-semibold font-serif my-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-2xl font-semibold font-serif my-2" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-base leading-relaxed mb-4" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold" {...props} />
        ),
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="list-disc ml-6 mb-4" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal ml-6 mb-4" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-400 pl-4 italic text-gray-600 my-4"
            {...props}
          />
        ),
          // @ts-ignore
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code
              className="bg-gray-100 px-1 rounded text-sm font-mono"
              {...props}
            />
          ) : (
            <pre className="bg-gray-900 text-white p-4 rounded my-4 overflow-x-auto">
              <code {...props} />
            </pre>
          ),
      }}
    >
      {sanitizeMarkdown()}
    </ReactMarkdown>
  );
};

