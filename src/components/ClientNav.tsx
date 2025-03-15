// src/components/ClientNav.tsx
'use client';

import React, { Suspense } from 'react';
import AlgorithmNav from './AlgorithmNav';

export function ClientNav() {
  return (
    <Suspense fallback={<div className="p-4 bg-white dark:bg-dark-700 rounded-lg shadow">Loading navigation...</div>}>
      <AlgorithmNav />
    </Suspense>
  );
} 
