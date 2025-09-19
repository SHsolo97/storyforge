import { PlayerProgress, ConditionalClause } from './types';

/**
 * StateManager - The Brain
 * Holds the local, in-memory copy of the PlayerProgress document.
 * This is the single source of truth for the UI.
 */
export class StateManager {
  private progress: PlayerProgress;
  private listeners: Set<() => void> = new Set();

  constructor(initialProgress: PlayerProgress) {
    this.progress = { ...initialProgress };
    this.ensureDefaultVariables();
  }

  /**
   * Initialize default variables if they don't exist
   */
  private ensureDefaultVariables() {
    if (!this.progress.variables) {
      this.progress.variables = {};
    }
    
    // Ensure default stats exist
    const defaultStats = {
      Confidence: 0,
      Empathy: 0,
      Creativity: 0,
      diamonds: 100, // Default diamond balance
      tickets: 5     // Default ticket balance
    };

    for (const [key, value] of Object.entries(defaultStats)) {
      if (!(key in this.progress.variables)) {
        this.progress.variables[key] = value;
      }
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get the entire progress object
   */
  getProgress(): PlayerProgress {
    return { ...this.progress };
  }

  /**
   * Get a specific variable value
   */
  getVariable(varName: string): any {
    return this.progress.variables[varName];
  }

  /**
   * Set a variable value
   */
  setVariable(varName: string, value: any) {
    this.progress.variables[varName] = value;
    this.notify();
  }

  /**
   * Increment a numeric variable
   */
  incrementVariable(varName: string, amount: number = 1) {
    const currentValue = this.getVariable(varName) || 0;
    this.setVariable(varName, currentValue + amount);
  }

  /**
   * Decrement a numeric variable
   */
  decrementVariable(varName: string, amount: number = 1) {
    const currentValue = this.getVariable(varName) || 0;
    this.setVariable(varName, Math.max(0, currentValue - amount));
  }

  /**
   * Update the current node
   */
  setCurrentNode(nodeId: string) {
    console.log(`[StateManager] Setting current node from ${this.progress.resumeNodeId} to ${nodeId}`);
    this.progress.resumeNodeId = nodeId;
    console.log(`[StateManager] After setting, getCurrentNode() returns: ${this.progress.resumeNodeId}`);
    this.notify();
  }

  /**
   * Get the current node ID
   */
  getCurrentNode(): string {
    console.log(`[StateManager] getCurrentNode() called, returning: ${this.progress.resumeNodeId}`);
    return this.progress.resumeNodeId;
  }

  /**
   * Update the entire progress object (used for initialization)
   */
  updateProgress(newProgress: PlayerProgress) {
    console.log(`[StateManager] Updating progress from ${this.progress.resumeNodeId} to ${newProgress.resumeNodeId}`);
    this.progress = { ...newProgress };
    this.ensureDefaultVariables();
    this.notify();
  }

  /**
   * Update character customization
   */
  setCustomization(characterKey: string, customization: Record<string, string>) {
    if (!this.progress.customization) {
      this.progress.customization = {};
    }
    this.progress.customization[characterKey] = customization;
    this.notify();
  }

  /**
   * Get character customization
   */
  getCustomization(characterKey: string): Record<string, string> | undefined {
    return this.progress.customization?.[characterKey];
  }

  /**
   * Evaluate conditional clauses for effects
   */
  evaluateConditions(conditions: ConditionalClause[]): boolean {
    return conditions.every(condition => {
      const varValue = this.getVariable(condition.var);
      
      switch (condition.op) {
        case 'eq':
          return varValue === condition.value;
        case 'neq':
          return varValue !== condition.value;
        case 'gt':
          return varValue > condition.value;
        case 'gte':
          return varValue >= condition.value;
        case 'lt':
          return varValue < condition.value;
        case 'lte':
          return varValue <= condition.value;
        default:
          console.warn(`Unknown condition operator: ${condition.op}`);
          return false;
      }
    });
  }

  /**
   * Evaluate branch conditions and return target node
   */
  evaluateBranch(branchArgs: { conditions: Array<{ when: ConditionalClause[], target: string }>, default?: string }): string {
    for (const condition of branchArgs.conditions) {
      if (this.evaluateConditions(condition.when)) {
        return condition.target;
      }
    }
    return branchArgs.default || this.getCurrentNode();
  }

  /**
   * Check if player can afford a choice
   */
  canAfford(cost: number, costType: 'diamonds' | 'tickets'): boolean {
    const balance = this.getVariable(costType);
    return balance >= cost;
  }

  /**
   * Spend currency for a choice
   */
  spendCurrency(cost: number, costType: 'diamonds' | 'tickets'): boolean {
    if (this.canAfford(cost, costType)) {
      this.decrementVariable(costType, cost);
      return true;
    }
    return false;
  }
}