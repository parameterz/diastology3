'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import algorithms from '@/algorithms';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';

// Define the display order for algorithms (reverse chronological)
const algorithmDisplayOrder = [
  'mayo2025',  // Display in reverse chronological order
  'bse2024',   
  'ase2016'    
  // Add more algorithm IDs in preferred order as needed
];

const AlgorithmNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAlgo, setExpandedAlgo] = useState<string | null>(null);

  // Create an ordered array of algorithms based on the defined order
  const orderedAlgorithms = algorithmDisplayOrder
    .map(id => algorithms[id])
    .filter(Boolean); // Filter out any undefined values

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle algorithm expansion for mobile view
  const toggleAlgoExpansion = (algoId: string) => {
    setExpandedAlgo(expandedAlgo === algoId ? null : algoId);
  };

  // Set the initially expanded algorithm based on the current path
  useEffect(() => {
    if (pathname) {
      // Extract the algorithm ID from the path
      const match = pathname.match(/\/algorithms\/([^\/]+)/);
      if (match && match[1]) {
        setExpandedAlgo(match[1]);
      }
    }
  }, [pathname]);

  return (
    <nav className="bg-white dark:bg-dark-700 rounded-lg shadow-sm">
      {/* Mobile nav toggle button */}
      <div className="lg:hidden p-4 flex justify-between items-center border-b border-gray-200 dark:border-dark-600">
        <h2 className="text-lg font-semibold">Algorithms</h2>
        <button 
          onClick={toggleMenu}
          className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-dark-600"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation content - hidden on mobile unless toggled */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4`}>
        <h2 className="hidden lg:block mb-4 text-lg font-semibold">Algorithms</h2>
        
        <ul className="space-y-2">
          {orderedAlgorithms.map((algo) => (
            <li key={algo.id} className="rounded-md overflow-hidden">
              {/* Algorithm with multiple modes */}
              {algo.modes && algo.modes.length > 1 ? (
                <div>
                  {/* Algorithm header - clickable on mobile */}
                  <div 
                    className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-600 cursor-pointer"
                    onClick={() => toggleAlgoExpansion(algo.id)}
                  >
                    <span className="font-medium">{algo.name}</span>
                    <span className="lg:hidden">
                      {expandedAlgo === algo.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </div>
                  
                  {/* Algorithm modes - always visible on desktop, toggleable on mobile */}
                  <div className={`pl-4 space-y-2 ${(expandedAlgo === algo.id || pathname.includes(`/algorithms/${algo.id}`)) ? 'block' : 'hidden lg:block'}`}>
                    {algo.modes.map((mode) => (
                      <Link
                        key={mode.id}
                        href={`/algorithms/${algo.id}?mode=${mode.id}`}
                        className={`block py-2 px-3 text-sm rounded-lg ${
                          pathname === `/algorithms/${algo.id}` && searchParams.get('mode') === mode.id
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'hover:bg-gray-50 dark:hover:bg-dark-600'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {mode.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                // Algorithm with single mode or no modes
                <Link
                  href={`/algorithms/${algo.id}${algo.modes && algo.modes.length === 1 ? `?mode=${algo.modes[0].id}` : ''}`}
                  className={`block p-3 ${
                    pathname === `/algorithms/${algo.id}` && (!algo.modes || algo.modes.length <= 1 || !searchParams.get('mode'))
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-600'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {algo.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}


export default AlgorithmNav;