// src/app/algorithms/page.tsx
'use client';

import algorithms from '@/algorithms';
import Link from 'next/link';


// Define the display order for algorithms
const algorithmDisplayOrder = [
  'mayo2025',  // Display in reverse chronological order
  'bse2024',   
  'ase2016'    
  // Add more algorithm IDs in your preferred order
];

export default function AlgorithmsPage() {
  // Create an ordered array of algorithms based on the defined order
  const orderedAlgorithms = algorithmDisplayOrder
    .map(id => algorithms[id])
    .filter(Boolean); // Filter out any undefined values (in case an ID doesn't exist)

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="mb-4 text-center">Available Algorithms</h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-300">
          Select an algorithm to start your assessment
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        {orderedAlgorithms.map((algo) => (
          <div key={algo.id} className="rounded-lg bg-white p-6 shadow-md dark:bg-dark-700">
            <h2 className="mb-3 text-xl font-semibold">{algo.name}</h2>
            {algo.description && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                {algo.description}
              </p>
            )}
            
            {algo.citation && (
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Source:</span> {algo.citation.authors} • {algo.citation.journal}
              </p>
            )}
            
            {algo.modes ? (
              <div className="space-y-3">
                {algo.modes.map((mode) => (
                  <Link
                    key={mode.id}
                    href={`/algorithms/${algo.id}?mode=${mode.id}`}
                    className="btn-primary block w-full px-4 py-2 text-center text-sm"
                  >
                    {mode.name}
                    {mode.description && (
                      <span className="block text-xs mt-1 opacity-80">{mode.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={`/algorithms/${algo.id}`}
                className="btn-primary block w-full px-4 py-2 text-center"
              >
                Start Assessment
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}