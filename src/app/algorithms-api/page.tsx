//src/app/algorithms-api/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Badge, BookOpen } from 'lucide-react';

interface Algorithm {
  id: string;
  name: string;
  description?: string;
  citation: {
    authors: string;
    title: string;
    journal: string;
    url: string;
  },
  modes?: {
    id: string;
    name: string;
    description?: string;
  }[];
}

export default function AlgorithmsPage() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlgorithms() {
      try {
        setLoading(true);
        const response = await fetch('/api/algorithms');
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        setAlgorithms(data.algorithms);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching algorithms:', err);
        setError(`Failed to load algorithms: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    }
    
    fetchAlgorithms();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-4 text-center">Diastolic Function Algorithms</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded max-w-3xl mx-auto mb-8"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded max-w-2xl mx-auto"></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-4/6 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-4 text-center">Diastolic Function Algorithms</h1>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-red-800 dark:text-red-300">
          <h2 className="text-xl font-bold mb-2">Error Loading Algorithms</h2>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Separate active and coming soon algorithms
  const activeAlgorithms = algorithms.filter(algo => algo.id === 'mayo2025');
  const comingSoonAlgorithms = algorithms.filter(algo => algo.id !== 'mayo2025');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="mb-4 text-center">Diastolic Function Algorithms</h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Select an algorithm to start your assessment. Each algorithm is based on published guidelines 
          and provides an interactive way to navigate through the diagnostic process.
        </p>
      </div>

      {/* Active algorithms */}
      {activeAlgorithms.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Badge className="w-5 h-5 mr-2 text-green-600" />
            <span>Available Algorithms</span>
          </h2>
          
          {activeAlgorithms.map(algorithm => (
            <div key={algorithm.id} className="bg-white dark:bg-dark-700 rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 md:flex items-start space-x-0 md:space-x-6">
                <div className="shrink-0 hidden md:flex md:items-center md:justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 md:mb-0">
                  <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{algorithm.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {algorithm.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Source:</span> {algorithm.citation.authors} • {algorithm.citation.journal}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {algorithm.modes?.map((mode) => (
                      <Link
                        key={mode.id}
                        href={`/algorithms/${algorithm.id}?mode=${mode.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center text-sm"
                      >
                        {mode.name}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Coming soon algorithms */}
      {comingSoonAlgorithms.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Badge className="w-5 h-5 mr-2 text-yellow-600" />
            <span>Coming Soon</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoonAlgorithms.map(algorithm => (
              <div key={algorithm.id} className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6 opacity-70">
                <h3 className="text-lg font-bold mb-2">{algorithm.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {algorithm.description}
                </p>
                <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-full text-xs">Coming Soon</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show fallback if no algorithms found */}
      {algorithms.length === 0 && !loading && !error && (
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">No algorithms available at this time.</p>
        </div>
      )}
    </div>
  );
}