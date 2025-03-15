// app/components/FlowchartNavigator.tsx
// FlowchartNavigator component for rendering algorithm flowcharts
'use client'

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, ArrowLeft, RotateCcw, Info } from 'lucide-react';
import algorithms from '@/algorithms';
import { OptionValue, Result, AlgorithmMode } from '@/types/algorithm';

// Dynamic import to avoid SSR issues
// import dynamic from 'next/dynamic';
import { AlgorithmNavigator } from '@/services/AlgorithmNavigator';

interface FlowchartNavigatorProps {
  algorithmId: string;
  modeId?: string;
}

// Create a component that only renders on the client side
const FlowchartNavigator: React.FC<FlowchartNavigatorProps> = ({ algorithmId, modeId }) => {
  // State for navigator
  const [navigator, setNavigator] = useState<AlgorithmNavigator | null>(null);
  
  // Track visible nodes and their state
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [selections, setSelections] = useState<Record<string, { value: OptionValue, display: string }>>({});
  
  // Result state
  const [result, setResult] = useState<Result | null>(null);  
  // Mode info
  const [currentMode, setCurrentMode] = useState<AlgorithmMode | null>(null);
  const [hasMultipleModes, setHasMultipleModes] = useState<boolean>(false);
  
  // Track if the last node we processed was an evaluator
  const [lastNodeWasEvaluator, setLastNodeWasEvaluator] = useState<boolean>(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize navigator on client-side only
  useEffect(() => {
    // Reset result state when algorithm changes
    setResult(null);
    // Import the AlgorithmNavigator dynamically to avoid SSR issues
    const initNavigator = async () => {
      try {
        setIsLoading(true);
        // Dynamically import the AlgorithmNavigator
        const { AlgorithmNavigator } = await import('@/services/AlgorithmNavigator');
        // Create a new instance with the new keyword
        const nav = new AlgorithmNavigator(algorithms);
        setNavigator(nav);
        
        // Check if algorithm has multiple modes
        const algorithm = algorithms[algorithmId];
        const multipleModes = !!(algorithm.modes && algorithm.modes.length > 1);
        setHasMultipleModes(multipleModes);
        
        // Find and set current mode info if applicable
        if (algorithm.modes && modeId) {
          const mode = algorithm.modes.find(m => m.id === modeId);
          if (mode) {
            setCurrentMode(mode);
          }
        }
        
        // Initialize the algorithm
        nav.startAlgorithm(algorithmId, modeId);
        const startNode = nav.getCurrentNode();
        setCurrentNodeId(startNode.id);
        setVisibleNodes([startNode.id]);
        setExpandedNodes(new Set([startNode.id]));
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing navigator:", err);
        setError(`Error initializing: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };
    
    initNavigator();
  }, [algorithmId, modeId]);

  // Don't render anything until loading is complete
  if (isLoading) {
    return (
      <div className="space-y-4 bg-white dark:bg-dark-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold dark:text-white">Loading Algorithm...</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-5/6 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !navigator) {
    return (
      <div className="space-y-4 bg-white dark:bg-dark-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Error Loading Algorithm</h2>
        <p className="text-gray-700 dark:text-gray-300">
          {error || "Failed to initialize the algorithm navigator."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Process the next node after selection
  const processNextNode = () => {
    try {
      const nextNode = navigator.getCurrentNode();
      
      // Check if we're at a result node
      if (nextNode.type === 'result') {
        const resultData = navigator.getResult();
        setResult(resultData);
        return true;
      } else {
        // Add next node to visible and expanded sets
        setVisibleNodes(prev => [...prev, nextNode.id]);
        setExpandedNodes(prev => new Set([...prev, nextNode.id]));
        
        // Set focus to next node
        setCurrentNodeId(nextNode.id);
        
        // If the next node is an evaluator, we need to handle it immediately
        if (nextNode.type === 'evaluator') {
          setLastNodeWasEvaluator(true);
          // For evaluator nodes, we need to trigger evaluation automatically
          setTimeout(() => {
            handleSelection(nextNode.id, "Auto-evaluation", "auto");
          }, 300); // Small delay for visual feedback
        } else {
          setLastNodeWasEvaluator(false);
        }
        
        return false;
      }
    } catch (error) {
      console.error("Error processing next node:", error);
      return false;
    }
  };

  // Handle option selection
  const handleSelection = (nodeId: string, displayValue: string, value: OptionValue) => {
    try {
      // Check if the current node is an evaluator node
      const currentNode = algorithms[algorithmId].nodes[nodeId];
      const isEvaluator = currentNode?.type === 'evaluator';
      
      // Store selection for display purposes
      setSelections(prev => ({
        ...prev,
        [nodeId]: { value, display: displayValue }
      }));

      // Submit answer to navigator
      navigator.submitAnswer(value);
      
      // Process the next node
      const foundResult = processNextNode();
      
      // If we just processed an evaluator and didn't find a result, check again
      if ((isEvaluator || lastNodeWasEvaluator) && !foundResult) {
        // Double-check if we're at a result node now
        if (navigator.isAtResult()) {
          const resultData = navigator.getResult();
          setResult(resultData);
        }
      }
    } catch (error) {
      console.error("Error processing selection:", error);
    }
  };

  // Handle going back to a previous node
  const handleGoBack = () => {
    if (navigator.canGoBack()) {
      // Get current node before going back (to remove it from visible nodes)
      const currentNode = navigator.getCurrentNode();
      
      // Go back to previous node
      navigator.goBack();
      
      // Get the node we went back to
      const previousNode = navigator.getCurrentNode();
      
      // Update UI state
      setCurrentNodeId(previousNode.id);
      setVisibleNodes(prev => prev.filter(id => id !== currentNode.id));
      
      // Remove the selection for the node we're removing
      setSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[currentNode.id];
        return newSelections;
      });
      
      // Clear result if we had one
      setResult(null);
      setLastNodeWasEvaluator(false);
    }
  };

  // Handle restart
  const handleRestart = () => {
    navigator.restart();
    const startNode = navigator.getCurrentNode();
    setCurrentNodeId(startNode.id);
    setVisibleNodes([startNode.id]);
    setExpandedNodes(new Set([startNode.id]));
    setSelections({});
    setResult(null);
    setLastNodeWasEvaluator(false);
  };

  // Render a single node in the flowchart
  const NodeComponent = ({ id }: { id: string }) => {
    try {
      if (!visibleNodes.includes(id)) return null;
      
      const node = algorithms[algorithmId].nodes[id];
      if (!node) return null;

      const isActive = currentNodeId === id;
      const selectedOption = selections[id];
      const isCompleted = !!selectedOption;
      
      // Only decision nodes have options
      const options = node.type === 'decision' ? node.options : [];

      return (
        <div className="mb-2">
          <div 
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
              ${isActive ? 'bg-blue-100 border-2 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400' : 
                isCompleted ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30' : 
                'bg-gray-50 hover:bg-gray-100 dark:bg-dark-700 dark:hover:bg-dark-600'}`}
            onClick={() => {
              if (!result) { // Only allow changing focus if not at result
                setCurrentNodeId(id);
                setExpandedNodes(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(id)) {
                    if (!isActive) {
                      // Don't collapse if just activating
                    } else {
                      newSet.delete(id);
                    }
                  } else {
                    newSet.add(id);
                  }
                  return newSet;
                });
              }
            }}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm dark:text-white">
                  {node.type === 'decision' ? node.question : 
                   node.type === 'result' ? 'Result' : 
                   'Evaluating answers...'}
                </h3>
                {isCompleted && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="truncate max-w-xs">{selectedOption.display}</span>
                  </div>
                )}
              </div>
              {node.type === 'decision' && isActive && !result && (
                <div className="mt-2 space-y-1">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      className={`block w-full text-left px-3 py-1 text-sm rounded 
                        ${selectedOption && selectedOption.value === option.value
                          ? 'bg-blue-500 text-white dark:bg-blue-600' 
                          : 'bg-white hover:bg-blue-50 border border-gray-200 dark:bg-dark-600 dark:border-dark-500 dark:hover:bg-dark-500 dark:text-white'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelection(id, option.text, option.value);
                      }}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}
              {node.type === 'evaluator' && isActive && !result && (
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="flex items-center justify-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 dark:border-blue-400 mr-2"></div>
                    <span>Evaluating your answers...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error(`Error rendering node ${id}:`, error);
      return <div>Error rendering node</div>;
    }
  };

  return (
    <div className="space-y-4 bg-white dark:bg-dark-700 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Algorithm Navigator</h2>
        <div className="flex space-x-2">
          {navigator.canGoBack() && !result && (
            <button 
              onClick={handleGoBack}
              className="flex items-center text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-600 dark:hover:bg-dark-500 dark:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}
          {(result || visibleNodes.length > 1) && (
            <button 
              onClick={handleRestart}
              className="flex items-center text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-600 dark:hover:bg-dark-500 dark:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </button>
          )}
        </div>
      </div>

      {/* Mode information - only show when algorithm has multiple modes */}
      {hasMultipleModes && currentMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 flex items-start">
          <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300 text-sm">{currentMode.name}</h3>
            {currentMode.description && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{currentMode.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Flowchart nodes */}
      <div className="space-y-1">
        {visibleNodes.map(nodeId => (
          <NodeComponent key={nodeId} id={nodeId} />
        ))}
      </div>

      {/* Results Panel */}
      {result && (
        <div className={`p-4 rounded-lg ${
          result.class === 'result-normal' ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : 
          result.class === 'result-impaired' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500' : 
          'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
        }`}>
          <div className="flex items-start">
            <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
              result.class === 'result-normal' ? 'text-green-600 dark:text-green-400' : 
              result.class === 'result-impaired' ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-red-600 dark:text-red-400'
            }`} />
            <div>
              <h3 className="font-bold text-lg dark:text-white">{result.message}</h3>
              <p className="text-sm mt-1 dark:text-gray-300">{result.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export as client-only component
export default FlowchartNavigator;