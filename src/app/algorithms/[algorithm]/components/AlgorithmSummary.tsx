// src/app/algorithms/[algorithm]/components/AlgorithmSummary.tsx
'use client'

interface AlgorithmSummaryProps {
  title: string;
  description: string;
}

export function AlgorithmSummary({ title, description }: AlgorithmSummaryProps) {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm">
      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800 dark:text-gray-100">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 md:text-lg">
        {description}
      </p>
    </div>
  )
}