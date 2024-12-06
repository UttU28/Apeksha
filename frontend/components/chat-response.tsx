"use client";

import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useState } from "react";

interface ChatResponseProps {
  response: string | null;
}

export default function ChatResponse({ response }: ChatResponseProps) {
  if (!response) return null;

  // Preprocess the response to ensure newlines are properly handled for Markdown rendering
  const formattedResponse = response.replace(/\\n/g, '\n');

  return (
    <Card className="p-6 bg-muted/50">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'text';
              const content = String(children).replace(/\n$/, '');

              const [copied, setCopied] = useState(false);

              const handleCopy = () => {
                navigator.clipboard.writeText(content);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset to "Copy" after 2 seconds
              };

              // Render inline code blocks or small code snippets
              if (inline || !content.includes('\n')) {
                return (
                  <code
                    className="font-mono text-base px-1 py-0.5 rounded"
                    {...props}
                  >
                    {content}
                  </code>
                );
              }

              // Render multiline code blocks with syntax highlighting and copy button
              return (
                <div className="relative group">
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                      fontSize: '1rem',
                      margin: 0,
                      borderRadius: '0.5rem',
                      position: 'relative',
                    }}
                    {...props}
                  >
                    {content}
                  </SyntaxHighlighter>
                  {/* Copy to Clipboard Button */}
                  <button
                    onClick={handleCopy}
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-sm transition-colors ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              );
            },
          }}
        >
          {formattedResponse}
        </ReactMarkdown>
      </div>
    </Card>
  );
}
