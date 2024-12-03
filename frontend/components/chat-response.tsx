"use client";

import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ChatResponseProps {
  response: string | null;
}

export default function ChatResponse({ response }: ChatResponseProps) {
  if (!response) return null;

  return (
    <Card className="p-6 bg-muted/50">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'text';
              const content = String(children).replace(/\n$/, '');
              
              // If it's an inline code block or doesn't contain newlines
              if (inline || !content.includes('\n')) {
                return (
                  <code className="font-mono text-sm px-1 py-0.5 rounded" {...props}>
                    {content}
                  </code>
                );
              }

              // For multiline code blocks
              return (
                <div className="relative">
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                    }}
                    {...props}
                  >
                    {content}
                  </SyntaxHighlighter>
                </div>
              );
            },
          }}
        >
          {response}
        </ReactMarkdown>
      </div>
    </Card>
  );
}