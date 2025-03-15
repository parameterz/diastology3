// src/data/results.ts - Shared results
import { ResultKey, Result } from '../types/algorithm';

export const results: Record<ResultKey, Result> = {
  'normal': {
    message: 'Normal Diastolic Function',
    class: 'result-normal',
    description: ''
  },
  'af-normal': {
    message: 'Normal Filling Pressures',
    class: 'result-normal',
    description: 'Despite atrial fibrillation, filling pressures appear normal.'
  },
    'grade-1': {
        message: 'Grade I Diastolic Dysfunction',
        class: 'result-impaired',
        description: 'Impaired relaxation with NORMAL Filling Pressures.'
    },
    'impaired-normal': {
        message: 'Impaired Relaxation, Normal Filling Pressures',
        class: 'result-impaired',
        description: 'Impaired relaxation with NORMAL Filling Pressures.'
    },
    'impaired-elevated': {
        message: 'Impaired Diastolic Function with ELEVATED Filling Pressures',
        class: 'result-elevated',
        description: 'Impaired relaxation with ELEVATED Filling Pressures.'
    },
    'grade-2': {
        message: 'Grade II Diastolic Dysfunction',
        class: 'result-elevated',
        description: 'Pseudo-Normal Filling with ELEVATED Filling Pressures.'
    },
    'grade-3': {
        message: 'Grade III Diastolic Dysfunction',
        class: 'result-elevated',
        description: 'Restrictive Filling with ELEVATED Filling Pressures.'
    },
    'indeterminate': {
        message: 'Indeterminate Diastolic Function',
        class: 'result-impaired',
        description: 'The diastolic function of the heart cannot be determined.'
    },
    'insufficient_info': {
        message: 'Insufficient Information',
        class: 'result-impaired',
        description: 'There is insufficient information to determine diastolic function.'
    },
    'exclude': {
        message: 'Exclude Diastolic Function',
        class: 'result-impaired',
        description: 'Diastolic function should be excluded from the interpretation.'
    }
  // ... other results
};