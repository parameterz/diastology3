// src/app/api/algorithms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAlgorithm, getAlgorithmMetadata } from '@/services/algorithmRegistry';
import { results } from '@/data/results';
import { Node } from '@/types/algorithm';

// Helper function to get a node from an algorithm
function getNode(algorithm: any, nodeId: string) {
  return algorithm.nodes[nodeId];
}

// Format node data for client
function formatNodeForClient(node: Node) {
  if (!node) return null;

  const baseNode = {
    id: node.id,
    type: node.type,
  };

  if (node.type === 'decision') {
    return {
      ...baseNode,
      question: node.question,
      options: node.options,
    };
  } else if (node.type === 'result') {
    return {
      ...baseNode,
      resultKey: node.resultKey,
      result: results[node.resultKey],
    };
  } else if (node.type === 'evaluator') {
    // For evaluator nodes, we'll handle differently
    return {
      ...baseNode,
      // We don't expose the evaluation function to the client
    };
  }

  return baseNode;
}

// Handle GET request to get algorithm metadata or a specific node
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const algorithmId = params.id;
  const algorithm = getAlgorithm(algorithmId);
  
  if (!algorithm) {
    return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const nodeId = searchParams.get('nodeId');
  const modeId = searchParams.get('mode');
  
  // If no node ID is specified, return algorithm metadata
  if (!nodeId) {
    // Determine starting node based on mode
    let startNodeId = algorithm.startNodeId;
    if (modeId && algorithm.modes) {
      const mode = algorithm.modes.find(m => m.id === modeId);
      if (mode) {
        startNodeId = mode.startNodeId;
      }
    }
    
    const startNode = getNode(algorithm, startNodeId);
    
    return NextResponse.json({
      algorithm: getAlgorithmMetadata(algorithmId),
      currentNode: formatNodeForClient(startNode),
    });
  }
  
  // If node ID is specified, return that node
  const node = getNode(algorithm, nodeId);
  
  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    algorithm: getAlgorithmMetadata(algorithmId),
    currentNode: formatNodeForClient(node),
  });
}

// Handle POST request to submit an answer and get the next node
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const algorithmId = params.id;
  const algorithm = getAlgorithm(algorithmId);
  
  if (!algorithm) {
    return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
  }
  
  const data = await request.json();
  const { nodeId, answer, history = [] } = data;
  
  const node = getNode(algorithm, nodeId);
  
  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }
  
  // Add current node and answer to history
  const updatedHistory = [...history, { nodeId, answer }];
  
  // Create answers object from history
  const answers: Record<string, string> = {};
  for (const item of updatedHistory) {
    answers[item.nodeId] = item.answer;
  }
  
  // Determine next node
  let nextNodeId: string;
  
  if (node.type === 'decision') {
    // For decision nodes, use the nextNodes mapping
    if (node.nextNodes[answer]) {
      nextNodeId = node.nextNodes[answer];
    } else if (node.nextNodes['*']) {
      nextNodeId = node.nextNodes['*'];
    } else {
      return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
    }
  } else if (node.type === 'evaluator') {
    // For evaluator nodes, run the evaluate function
    nextNodeId = node.evaluate(answers);
  } else {
    return NextResponse.json({ error: 'Cannot process node of type result' }, { status: 400 });
  }
  
  const nextNode = getNode(algorithm, nextNodeId);
  
  if (!nextNode) {
    return NextResponse.json({ error: 'Next node not found' }, { status: 500 });
  }
  
  // Handle evaluator nodes - immediately process them
  if (nextNode.type === 'evaluator') {
    // For evaluator nodes, we need to immediately evaluate and return the next node
    const evaluatedNodeId = nextNode.evaluate(answers);
    const evaluatedNode = getNode(algorithm, evaluatedNodeId);
    
    // Add the evaluator node to history (without displaying to user)
    updatedHistory.push({ nodeId: nextNode.id, answer: 'auto-evaluation' });
    
    return NextResponse.json({
      currentNode: formatNodeForClient(evaluatedNode),
      history: updatedHistory,
    });
  }
  
  return NextResponse.json({
    currentNode: formatNodeForClient(nextNode),
    history: updatedHistory
  });
}

// Handle PUT request to navigate back
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const algorithmId = params.id;
  const algorithm = getAlgorithm(algorithmId);
  
  if (!algorithm) {
    return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 });
  }
  
  const data = await request.json();
  const { history = [] } = data;
  
  if (history.length === 0) {
    return NextResponse.json({ error: 'Cannot go back from initial node' }, { status: 400 });
  }
  
  // Remove the last entry from history
  const updatedHistory = history.slice(0, -1);
  
  // Get the previous node
  const previousNodeId = updatedHistory.length > 0 
    ? updatedHistory[updatedHistory.length - 1].nodeId 
    : algorithm.startNodeId;
  
  const previousNode = getNode(algorithm, previousNodeId);
  
  if (!previousNode) {
    return NextResponse.json({ error: 'Previous node not found' }, { status: 500 });
  }
  
  // If previous node is an evaluator, go back one more step
  if (previousNode.type === 'evaluator') {
    const furtherUpdatedHistory = updatedHistory.slice(0, -1);
    const furtherPreviousNodeId = furtherUpdatedHistory.length > 0 
      ? furtherUpdatedHistory[furtherUpdatedHistory.length - 1].nodeId 
      : algorithm.startNodeId;
    
    const furtherPreviousNode = getNode(algorithm, furtherPreviousNodeId);
    
    if (!furtherPreviousNode) {
      return NextResponse.json({ error: 'Previous node not found' }, { status: 500 });
    }
    
    return NextResponse.json({
      currentNode: formatNodeForClient(furtherPreviousNode),
      history: furtherUpdatedHistory
    });
  }
  
  return NextResponse.json({
    currentNode: formatNodeForClient(previousNode),
    history: updatedHistory
  });
}

// Handle GET request for listing all algorithms
export async function HEAD(request: NextRequest) {
  // Implementation for listing all algorithms would go here
  // This is just a placeholder approach - typically you'd have a separate route
  return new Response(null, { status: 200 });
}