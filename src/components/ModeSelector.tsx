'use client'

import React from 'react';
import Link from 'next/link';
import algorithms from '@/algorithms';

interface ModeSelectorProps {
  algorithmId: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ algorithmId }) => {
  const algorithm = algorithms[algorithmId];
  
  if (!algorithm) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Algorithm not found
      </div>
    );
  }
  
  // If no modes or just one mode, we shouldn't even show this component
  // But as a fallback, we'll handle that case
  if (!algorithm.modes || algorithm.modes.length <= 1) {
    return (
      <div className="p-4 bg-white dark:bg-dark-700 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Algorithm Navigator</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Loading the standard algorithm...
        </p>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-dark-700 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Select Algorithm Mode</h2>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        This guideline provides {algorithm.modes.length} different assessment pathways.
        Please select which one to use:
      </p>
      
      <div className="space-y-3">
        {algorithm.modes.map((mode) => (
          <Link 
            key={mode.id}
            href={`/algorithms/${algorithmId}?mode=${mode.id}`}
            className="block w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors dark:bg-dark-600 dark:border-dark-500 dark:hover:bg-dark-500 dark:text-white"
          >
            <div className="font-medium">{mode.name}</div>
            {mode.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {mode.description}
              </p>
            )}
          </Link>
        ))}
      </div>
      
      {algorithm.citation && (
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
          <p className="font-semibold">Reference:</p>
          <p className="mt-1">{algorithm.citation.authors}</p>
          <p className="mt-1 italic">{algorithm.citation.title}</p>
          <p className="mt-1">
            <a href={algorithm.citation.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline">
              {algorithm.citation.journal}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;