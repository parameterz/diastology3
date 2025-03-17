//src/components/SimplifiedNavigator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, RotateCcw, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Option {
  value: string;
  text: string;
}

interface Result {
  message: string;
  class: string;
  description: string;
}

interface Node {
  id: string;
  type: 'decision' | 'result' | 'evaluator';
  question?: string;
  options?: Option[];
  resultKey?: string;
  result?: Result;
}

interface HistoryItem {
  nodeId: string;
  answer: string;
  displayText?: string;
}

interface SimplifiedNavigatorProps {
  algorithmId: string;
  modeId?: string;
}

export default function SimplifiedNavigator({ algorithmId, modeId }: SimplifiedNavigatorProps) {
  // Track the current view mode
  const [viewMode, setViewMode] = useState('guided'); // 'guided' or 'visual'
  
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For visual mode
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [allNodes, setAllNodes] = useState<Record<string, Node>>({});
  
  const [algorithmInfo, setAlgorithmInfo] = useState({
    name: '',
    description: '',
    citation: {
      authors: '',
      title: '',
      journal: '',
      url: ''
    }
  });

  // Initialize the navigator
  useEffect(() => {
    const fetchInitialNode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the generalized API endpoint
        const response = await fetch(`/api/algorithms/${algorithmId}?${modeId ? `mode=${modeId}` : ''}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        setCurrentNode(data.currentNode);
        setAlgorithmInfo(data.algorithm);
        setHistory([]);
        
        // For visual mode
        setVisitedNodes([data.currentNode.id]);
        setExpandedNodes([data.currentNode.id]);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching initial node:", err);
        setError(`Error initializing: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };
    
    fetchInitialNode();
  }, [algorithmId, modeId]);

  // Handle selection of an option
  const handleSelection = async (nodeId: string, value: string, displayText: string) => {
    try {
      setIsLoading(true);
      
      // Use the generalized API endpoint
      const response = await fetch(`/api/algorithms/${algorithmId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId,
          answer: value,
          history,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentNode(data.currentNode);
      
      // Update history with display text
      const updatedHistory = [...data.history];
      // Update the last item with the display text
      if (updatedHistory.length > 0) {
        const lastIndex = updatedHistory.length - 1;
        updatedHistory[lastIndex] = {
          ...updatedHistory[lastIndex],
          displayText
        };
      }
      
      setHistory(updatedHistory);
      
      // For visual mode
      setVisitedNodes(prev => [...prev, data.currentNode.id]);
      setExpandedNodes(prev => [...prev, data.currentNode.id]);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing selection:", err);
      setError(`Error processing selection: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Handle going back to previous step
  const handleGoBack = async () => {
    if (history.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Use the generalized API endpoint
      const response = await fetch(`/api/algorithms/${algorithmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentNode(data.currentNode);
      setHistory(data.history);
      
      // For visual mode
      if (visitedNodes.length > 0) {
        setVisitedNodes(prev => prev.slice(0, -1));
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error going back:", err);
      setError(`Error going back: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Handle restart
  const handleRestart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the generalized API endpoint
      const response = await fetch(`/api/algorithms/${algorithmId}?${modeId ? `mode=${modeId}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentNode(data.currentNode);
      setHistory([]);
      
      // For visual mode
      setVisitedNodes([data.currentNode.id]);
      setExpandedNodes([data.currentNode.id]);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error restarting:", err);
      setError(`Error restarting: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Visual mode functions
  const handleNodeSelect = (nodeId: string) => {
    // In a real implementation, we would fetch the node data
    // For now, we just mark it as visited
    if (!visitedNodes.includes(nodeId)) {
      setVisitedNodes(prev => [...prev, nodeId]);
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };

  const getNodeStatusClass = (nodeId: string) => {
    if (currentNode && nodeId === currentNode.id) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (visitedNodes.includes(nodeId)) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    return 'border-gray-300 bg-white dark:bg-dark-700 dark:border-dark-500';
  };

  if (isLoading && !currentNode) {
    return (
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-xl font-bold">Loading Algorithm...</h2>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-5/6 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error Loading Algorithm</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={handleRestart}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentNode) return null;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
      {/* Header with mode toggle */}
      <div className="border-b border-gray-200 dark:border-dark-600 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{algorithmInfo.name}</h2>
          
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="p-1 bg-gray-100 dark:bg-dark-700 rounded-md">
              <button
                className={`px-3 py-1.5 text-sm rounded ${viewMode === 'guided' ? 'bg-white dark:bg-dark-600 shadow-sm' : ''}`}
                onClick={() => setViewMode('guided')}
              >
                Guided
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded ${viewMode === 'visual' ? 'bg-white dark:bg-dark-600 shadow-sm' : ''}`}
                onClick={() => setViewMode('visual')}
              >
                Visual
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="p-4">
        {viewMode === 'guided' ? (
          /* Guided Mode */
          <div className="space-y-4">
            {/* Current node */}
            {currentNode.type !== 'result' ? (
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-lg mb-3">{currentNode.question}</h3>
                <div className="space-y-2">
                  {currentNode.options?.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={isLoading}
                      className="w-full text-left px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50"
                      onClick={() => handleSelection(currentNode.id, option.value, option.text)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Result node */
              <div className={`border-l-4 p-4 rounded-lg ${
                currentNode.result?.class === 'result-normal' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                currentNode.result?.class === 'result-impaired' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 
                'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex">
                  {currentNode.result?.class === 'result-normal' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{currentNode.result?.message}</h3>
                    <p className="text-sm mt-1">{currentNode.result?.description}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Progress indicator */}
            <div className="pt-4 border-t border-gray-200 dark:border-dark-600">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Progress</span>
                <span>{history.length + 1} of {Math.max(5, history.length + 1)} steps</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((history.length + 1) / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          /* Visual Mode - Coming soon */
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-2">Visual flowchart mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon!</p>
          </div>
        )}
      </div>
      
      {/* Footer with action buttons */}
      <div className="border-t border-gray-200 dark:border-dark-600 p-4">
        <div className="flex justify-between">
          <button 
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50"
            onClick={handleRestart}
            disabled={isLoading || history.length === 0}
          >
            <RotateCcw size={16} className="mr-2 inline" />
            Restart
          </button>
          
          {history.length > 0 && (
            <button 
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50"
              onClick={handleGoBack}
              disabled={isLoading}
            >
              <ArrowLeft size={16} className="mr-2 inline" />
              Back
            </button>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}