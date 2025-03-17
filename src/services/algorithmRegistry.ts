// src/services/algorithmRegistry.ts
import { Algorithm } from '@/types/algorithm';
import mayo2025Algorithm from '@/app/algorithms/mayo2025/Mayo2025';
import bse2024Algorithm from '@/app/algorithms/bse2024/BSE2024';
import ase2016Algorithm from '@/app/algorithms/ase2016/ASE2016';

// Registry of all available algorithms
const algorithms: Record<string, Algorithm> = {
  'mayo2025': mayo2025Algorithm,
  'bse2024': bse2024Algorithm,
  'ase2016': ase2016Algorithm,
};

export function getAlgorithm(id: string): Algorithm | null {
  return algorithms[id] || null;
}

export function getAllAlgorithms(): Record<string, Algorithm> {
  return { ...algorithms };
}

// Get algorithm metadata without the full node definitions
export function getAlgorithmMetadata(id: string) {
  const algorithm = getAlgorithm(id);
  if (!algorithm) return null;
  
  return {
    id: algorithm.id,
    name: algorithm.name,
    description: algorithm.description,
    citation: algorithm.citation,
    modes: algorithm.modes
  };
}

// Get all algorithms metadata for listing
export function getAllAlgorithmsMetadata() {
  return Object.values(algorithms).map(algorithm => ({
    id: algorithm.id,
    name: algorithm.name,
    description: algorithm.description,
    citation: algorithm.citation,
    modes: algorithm.modes
  }));
}