'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SummaryAccordionProps {
  summary?: string | null;
}

export function SummaryAccordion({ summary }: SummaryAccordionProps) {
  if (!summary) {
    return null;
  }

  return (
    <div className="my-8">
      <Accordion
        type="single"
        collapsible
        className="w-full border border-gray-200 rounded-lg overflow-hidden"
        defaultValue="summary"
      >
        <AccordionItem value="summary" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <span className="text-lg font-semibold text-gray-900">Ver resumo</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <article className="max-w-none prose prose-sm dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-3 leading-tight" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3" {...props} />,
                  code: ({ node, inline, ...props }) => 
                    inline ? (
                      <code className="bg-gray-200 rounded px-2 py-1 text-sm font-mono text-gray-800" {...props} />
                    ) : (
                      <code className="bg-gray-200 rounded p-2 block text-sm font-mono text-gray-800 mb-3 overflow-x-auto" {...props} />
                    ),
                  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                  em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
                }}
              >
                {summary}
              </ReactMarkdown>
            </article>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
