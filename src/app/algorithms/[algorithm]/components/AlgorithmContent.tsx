// src/app/algorithms/[algorithm]/components/AlgorithmContent.tsx
'use client'

import MarkdownIt from 'markdown-it'

interface AlgorithmContentProps {
  content: string;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

export function AlgorithmContent({ content }: AlgorithmContentProps) {
  const htmlContent = md.render(content)
  
  return (
    <div className="algorithm-content p-6 bg-white dark:bg-dark-700 rounded-lg shadow">
      <div 
        className="prose prose-blue max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  )
}