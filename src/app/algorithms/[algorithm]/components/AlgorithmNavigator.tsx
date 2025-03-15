'use client'

import React, { Suspense, lazy, useState, useEffect } from 'react'
import algorithms from '@/algorithms'

// Lazy load the components to avoid SSR issues
const FlowchartNavigator = lazy(() => import('@/components/FlowchartNavigator'))
const ModeSelector = lazy(() => import('@/components/ModeSelector'))

interface NavigatorProps {
  algorithmId: string
  modeId?: string
}

export function AlgorithmNavigator({ algorithmId, modeId }: NavigatorProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Loading skeleton
  if (!isMounted) {
    return (
      <div className="p-4 bg-white dark:bg-dark-700 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Algorithm Navigator</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-5/6 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full"></div>
        </div>
      </div>
    )
  }
  
  // Check if algorithm exists
  const algorithm = algorithms[algorithmId]
  if (!algorithm) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Algorithm Not Found</h2>
        <p>Sorry, we couldn&apos;t find the algorithm you&apos;re looking for.</p>
      </div>
    )
  }
  
  // Check if we need a mode selection
  const needsModeSelection = algorithm.modes && algorithm.modes.length > 1 && !modeId
  
  // Determine which component to show
  const ComponentToRender = needsModeSelection 
    ? ModeSelector 
    : FlowchartNavigator
  
  // Props for the component
  const componentProps = needsModeSelection 
    ? { algorithmId } 
    : { 
        algorithmId,
        // If modeId is not provided but algorithm has exactly one mode, use that mode's id
        modeId: modeId || (algorithm.modes && algorithm.modes.length === 1 ? algorithm.modes[0].id : undefined)
      }
  
  return (
    <Suspense fallback={
      <div className="p-4 bg-white dark:bg-dark-700 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Loading Navigator...</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-5/6"></div>
        </div>
      </div>
    }>
      <ComponentToRender {...componentProps} />
    </Suspense>
  )
}