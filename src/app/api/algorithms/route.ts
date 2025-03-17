// src/app/api/algorithms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllAlgorithmsMetadata } from '@/services/algorithmRegistry';

// Handle GET request to list all available algorithms
export async function GET(request: NextRequest) {
  const algorithmsList = getAllAlgorithmsMetadata();
  
  return NextResponse.json({
    algorithms: algorithmsList
  });
}