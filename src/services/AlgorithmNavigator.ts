// src/services/AlgorithmNavigator.ts - Navigation service
import {
  Algorithm,
  Citation,
  Node,
  // DecisionNode,
  // EvaluatorNode,
  // ResultNode,
  // ResultKey,
  OptionValue,
  Result,
} from "../types/algorithm";
import { results } from "../data/results";

interface NavigationState {
  currentAlgorithmId: string;
  currentModeId?: string;
  currentNodeId: string;
  history: {
    nodeId: string;
    answer: OptionValue | null;
  }[];
  answers: Record<string, OptionValue>;
}

export class AlgorithmNavigator {
  private state: NavigationState;
  private algorithms: Record<string, Algorithm>;

  constructor(algorithms: Record<string, Algorithm>) {
    this.algorithms = algorithms;
    this.state = {
      currentAlgorithmId: "",
      currentNodeId: "",
      history: [],
      answers: {},
    };
  }

  // Start a new algorithm navigation
  public startAlgorithm(algorithmId: string, modeId?: string): void {
    const algorithm = this.algorithms[algorithmId];
    if (!algorithm) {
      throw new Error(`Algorithm with ID ${algorithmId} not found`);
    }

    // Determine starting node based on mode or default
    let startNodeId = algorithm.startNodeId;
    if (modeId && algorithm.modes) {
      const mode = algorithm.modes.find((m) => m.id === modeId);
      if (mode) {
        startNodeId = mode.startNodeId;
      }
    }

    // Reset state and set initial values
    this.state = {
      currentAlgorithmId: algorithmId,
      currentModeId: modeId,
      currentNodeId: startNodeId,
      history: [],
      answers: {},
    };
  }

  // Get the current node
  public getCurrentNode(): Node {
    if (!this.state.currentAlgorithmId || !this.state.currentNodeId) {
      throw new Error("No active algorithm or node");
    }

    const node =
      this.algorithms[this.state.currentAlgorithmId].nodes[
        this.state.currentNodeId
      ];
    if (!node) {
      throw new Error(
        `Node ${this.state.currentNodeId} not found in algorithm ${this.state.currentAlgorithmId}`
      );
    }

    return node;
  }

// Get the current algorithm
public getCurrentAlgorithm(): Algorithm {
    if (!this.state.currentAlgorithmId) {
      throw new Error('No active algorithm');
    }
  
    return this.algorithms[this.state.currentAlgorithmId];
  }

  // Submit an answer and move to the next node
  public submitAnswer(answer: OptionValue): void {
    const currentNode = this.getCurrentNode();

    if (currentNode.type === "result") {
      // Already at a result node, nothing to do
      return;
    } else if (
      currentNode.type === "decision" ||
      currentNode.type === "evaluator"
    ) {
      // Valid node types
    } else {
      throw new Error(`Unexpected node type: ${(currentNode as Node).type}`);
    }

    // Save answer in history
    this.state.history.push({
      nodeId: this.state.currentNodeId,
      answer: answer,
    });

    // For decision nodes, store answer by node ID
    if (currentNode.type === "decision") {
      this.state.answers[currentNode.id] = answer;
    }

    // Determine next node based on node type
    let nextNodeId: string;

    if (currentNode.type === "decision") {
      // For decision nodes, use the nextNodes mapping
      // First check if there's a specific mapping for this answer
      if (currentNode.nextNodes[answer]) {
        nextNodeId = currentNode.nextNodes[answer];
      }
      // Then check for a wildcard mapping
      else if (currentNode.nextNodes["*"]) {
        nextNodeId = currentNode.nextNodes["*"];
      } else {
        throw new Error(
          `No next node defined for answer ${answer} in node ${currentNode.id}`
        );
      }
    } else if (currentNode.type === "evaluator") {
      // For evaluator nodes, run the evaluate function
      nextNodeId = currentNode.evaluate(this.state.answers);
    } else {
      // This ensures TypeScript knows we've covered all possible node types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = currentNode;      
      throw new Error(`Unexpected node type: ${(currentNode as Node).type}`);
    }

    // Update current node
    this.state.currentNodeId = nextNodeId;
  }

  // Go back to the previous node
  public goBack(): boolean {
    if (this.state.history.length === 0) {
      // Can't go back any further
      return false;
    }

    // Remove the last entry from history
    const lastEntry = this.state.history.pop();
    if (!lastEntry) {
      return false;
    }

    // Remove the answer for the last node
    if (lastEntry.nodeId in this.state.answers) {
      delete this.state.answers[lastEntry.nodeId];
    }

    // Set current node to the previous one
    this.state.currentNodeId = lastEntry.nodeId;
    return true;
  }

  // Check if we're at a result node
  public isAtResult(): boolean {
    return this.getCurrentNode().type === "result";
  }

  // Get the result if we're at a result node
  public getResult(): Result | null {
    const currentNode = this.getCurrentNode();
    if (currentNode.type !== "result") {
      return null;
    }

    return results[currentNode.resultKey];
  }

  // Get all answers collected so far
  public getAnswers(): Record<string, OptionValue> {
    return { ...this.state.answers };
  }

  // Serialize the current state (for saving)
  public serializeState(): string {
    return JSON.stringify(this.state);
  }

  // Deserialize state (for loading)
  public deserializeState(serializedState: string): void {
    try {
      this.state = JSON.parse(serializedState);
    } catch (error: unknown) {
      // Properly type-check before accessing properties
      if (error instanceof Error) {
        throw new Error(`Failed to deserialize navigation state: ${error.message}`);
      } else {
        throw new Error('Failed to deserialize navigation state');
      }
    }
  }
  // Check if can go back
  public canGoBack(): boolean {
    return this.state.history.length > 0;
  }

  // Restart the current algorithm
  public restart(): void {
    if (!this.state.currentAlgorithmId) {
      throw new Error("No active algorithm to restart");
    }

    this.startAlgorithm(
      this.state.currentAlgorithmId,
      this.state.currentModeId
    );
  }

// Get the citation for the current algorithm
public getCitation(): Citation | null {
    if (!this.state.currentAlgorithmId) {
      return null; // Return null instead of throwing an error
    }
    return this.getCurrentAlgorithm().citation;
  }
}
