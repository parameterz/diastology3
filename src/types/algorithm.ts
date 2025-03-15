// src/types/algorithm.ts - Type definitions for the algorithm system

// Basic types
export type OptionValue = string;
export type ResultKey = 
  | 'normal' 
  | 'af-normal' 
  | 'grade-1' 
  | 'grade-2' 
  | 'grade-3'
  | 'impaired-normal' 
  | 'impaired-elevated' 
  | 'indeterminate'
  | 'insufficient_info'
  | 'exclude';

// Option displayed to the user
export interface Option {
  value: OptionValue;
  text: string;
}

// Result definition
export interface Result {
  message: string;
  class: string;
  description: string;
}

// Citation information
export interface Citation {
  authors: string;
  title: string;
  journal: string;
  url: string;
}

// Algorithm mode definition
export interface AlgorithmMode {
  id: string;
  name: string;
  description?: string;  // Added description for each mode
  startNodeId: string;
}

// Decision node - presents a question with options
export interface DecisionOption {
  value: string;
  text: string;
}

export interface NextNodesMap {
  [key: string]: string | undefined;  // Maps option values to next node IDs, including optional catch-all route
}

export interface DecisionNode {
  id: string;
  type: 'decision';
  question: string;
  options: DecisionOption[];  // Updated to use DecisionOption
  nextNodes: NextNodesMap;    // Updated to use NextNodesMap
}

// Evaluator node - evaluates multiple answers to determine next node
export interface EvaluatorNode {
  id: string;
  type: 'evaluator';
  evaluate: (answers: Record<string, OptionValue>) => string; // Returns next node ID
}

// Result node - displays a final result
export interface ResultNode {
  id: string;
  type: 'result';
  resultKey: ResultKey;
}

// Union type for all node types
export type Node = DecisionNode | EvaluatorNode | ResultNode;

// Complete algorithm definition
export interface Algorithm {
  id: string;
  name: string;
  description?: string;  // Added general description
  citation: {
    authors: string;
    title: string;
    journal: string;
    url: string;
  };
  modes?: AlgorithmMode[];
  startNodeId: string;
  nodes: Record<string, Node>;
}