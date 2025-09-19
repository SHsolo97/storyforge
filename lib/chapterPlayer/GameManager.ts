import { GameState, PlayerProgress, ChapterData, ChapterNode } from './types';
import { StateManager } from './StateManager';
import { AssetManager } from './AssetManager';
import { EffectsProcessor } from './EffectsProcessor';

/**
 * GameManager - The Orchestrator
 * The high-level controller that manages the overall game state.
 */
export class GameManager {
  private state: GameState = 'LOADING';
  private stateManager: StateManager;
  private assetManager: AssetManager;
  private effectsProcessor: EffectsProcessor;
  private chapterData: ChapterData | null = null;
  private listeners: Set<(state: GameState) => void> = new Set();
  private isProcessingNode = false; // Add state protection
  private pendingNodeChange: string | null = null; // Store the node ID to change to

  // UI callback handlers
  public onStateChange?: (state: GameState) => void;
  public onLoadingProgress?: (progress: number) => void;
  public onShowChoices?: (choices: any[]) => void;
  public onHideChoices?: () => void;

  constructor() {
    // Initialize with a default progress state
    const defaultProgress: PlayerProgress = {
      storyId: '',
      chapterId: '',
      resumeNodeId: '',
      variables: {}
    };

    this.stateManager = new StateManager(defaultProgress);
    this.assetManager = new AssetManager();
    this.effectsProcessor = new EffectsProcessor(this.stateManager, this.assetManager);

    this.setupEffectsProcessorHandlers();
    this.setupAssetManagerHandlers();
  }

  /**
   * Subscribe to state changes
   */
  onGameStateChange(listener: (state: GameState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Set game state and notify listeners
   */
  private setState(newState: GameState) {
    if (this.state !== newState) {
      this.state = newState;
      this.listeners.forEach(listener => listener(newState));
      this.onStateChange?.(newState);
    }
  }

  /**
   * Setup handlers for EffectsProcessor events
   */
  private setupEffectsProcessorHandlers() {
    this.effectsProcessor.onNodeComplete = (nextNodeId?: string) => {
      if (nextNodeId) {
        // Check if we're currently processing a node
        if (this.isProcessingNode) {
          console.log(`[GameManager] Node change requested during processing, deferring until completion`);
          this.pendingNodeChange = nextNodeId; // Store the node ID to change to
        } else {
          // Move to the next node immediately
          console.log(`[GameManager] Processing node change immediately: ${nextNodeId}`);
          this.processCurrentNode();
        }
      } else {
        // Chapter ended
        this.setState('ENDED');
      }
    };
  }

  /**
   * Setup handlers for AssetManager events
   */
  private setupAssetManagerHandlers() {
    this.assetManager.onProgress((progress) => {
      this.onLoadingProgress?.(progress);
      
      // When all assets are loaded, transition to playing
      if (progress >= 1 && this.state === 'LOADING') {
        this.setState('PLAYING');
        // Start processing the first node
        this.processCurrentNode();
      }
    });
  }

  /**
   * Initialize a chapter with player progress and chapter data
   */
  async initializeChapter(progress: PlayerProgress, chapterData: ChapterData): Promise<void> {
    this.setState('LOADING');
    
    // Update state manager with progress (don't create a new instance!)
    this.stateManager.updateProgress(progress);
    
    // Store chapter data
    this.chapterData = chapterData;
    
    // Set starting node if not already set
    if (!progress.resumeNodeId) {
      this.stateManager.setCurrentNode(chapterData.startNodeId);
    }

    // Start loading assets
    await this.assetManager.loadAssets(chapterData.assetManifest);
  }

  /**
   * Load chapter from JSON data (for local testing)
   */
  async loadChapterFromData(chapterData: ChapterData, storyId: string, chapterId: string): Promise<void> {
    const progress: PlayerProgress = {
      storyId,
      chapterId,
      resumeNodeId: chapterData.startNodeId,
      variables: {}
    };

    await this.initializeChapter(progress, chapterData);
  }

  /**
   * Process the current node
   */
  private async processCurrentNode() {
    if (this.isProcessingNode) {
      console.log(`[GameManager] processCurrentNode already in progress, skipping`);
      return;
    }

    if (!this.chapterData || this.state !== 'PLAYING') {
      console.log(`[GameManager] processCurrentNode skipped - chapterData: ${!!this.chapterData}, state: ${this.state}`);
      return;
    }

    this.isProcessingNode = true;
    this.pendingNodeChange = null; // Reset pending flag
    
    try {
      const currentNodeId = this.stateManager.getCurrentNode();
      console.log(`[GameManager] Processing node: ${currentNodeId}`);
      const currentNode = this.chapterData.nodes[currentNodeId];

      if (!currentNode) {
        console.error(`Node not found: ${currentNodeId}`);
        return;
      }

      // Hide choices while processing node
      this.onHideChoices?.();

      // Execute onEnter effects if they exist
      if (currentNode.onEnter && currentNode.onEnter.length > 0) {
        console.log(`[GameManager] Executing ${currentNode.onEnter.length} onEnter effects for node: ${currentNodeId}`);
        await this.effectsProcessor.execute(currentNode.onEnter);
      }

      // Check the current node again after effects execution - it may have changed via goto
      const finalNodeId = this.stateManager.getCurrentNode();
      console.log(`[GameManager] After effects execution - started with ${currentNodeId}, now at ${finalNodeId}`);
      
      // If the node changed during execution (goto operation), the processing will be handled by deferred logic
      if (finalNodeId !== currentNodeId) {
        console.log(`[GameManager] Node changed during execution from ${currentNodeId} to ${finalNodeId}, will be handled by deferred processing`);
        return; // Exit early, deferred processing will handle the new node
      }
      
      // Only show choices if we're still on the original node AND there are choices
      const finalNode = this.chapterData.nodes[currentNodeId];
      if (finalNode?.choices) {
        console.log(`[GameManager] Showing ${finalNode.choices.length} choices for node: ${currentNodeId}`);
        this.showChoices(finalNode.choices);
      } else {
        console.log(`[GameManager] No choices to show for node: ${currentNodeId}`);
      }
    } finally {
      this.isProcessingNode = false;
      
      // Check if there's a pending node change that was deferred
      if (this.pendingNodeChange) {
        const nodeToProcess = this.pendingNodeChange;
        console.log(`[GameManager] Processing deferred node change to: ${nodeToProcess}`);
        this.pendingNodeChange = null;
        // Use setTimeout to ensure we're out of the current call stack
        setTimeout(() => {
          this.processCurrentNode();
        }, 0);
      }
    }
  }

  /**
   * Show choices to the player
   */
  private showChoices(choices: any[]) {
    // Filter choices based on affordability
    const availableChoices = choices.map(choice => ({
      ...choice,
      canAfford: choice.cost ? this.stateManager.canAfford(choice.cost, choice.costType || 'diamonds') : true
    }));

    this.onShowChoices?.(availableChoices);
  }

  /**
   * Handle player choice selection
   */
  async selectChoice(choiceId: string): Promise<void> {
    if (this.state !== 'PLAYING' || !this.chapterData) {
      return;
    }

    const currentNodeId = this.stateManager.getCurrentNode();
    const currentNode = this.chapterData.nodes[currentNodeId];

    if (!currentNode?.choices) {
      return;
    }

    const selectedChoice = currentNode.choices.find(choice => choice.id === choiceId);
    if (!selectedChoice) {
      console.error(`Choice not found: ${choiceId}`);
      return;
    }

    // Check if player can afford the choice
    if (selectedChoice.cost && !this.stateManager.canAfford(selectedChoice.cost, selectedChoice.costType || 'diamonds')) {
      console.warn('Player cannot afford this choice');
      return;
    }

    // Spend the currency if required
    if (selectedChoice.cost) {
      this.stateManager.spendCurrency(selectedChoice.cost, selectedChoice.costType || 'diamonds');
    }

    // Hide choices
    this.onHideChoices?.();

    // Execute choice effects
    if (selectedChoice.effects && selectedChoice.effects.length > 0) {
      await this.effectsProcessor.execute(selectedChoice.effects);
    }
  }

  /**
   * Pause the game
   */
  pause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    }
  }

  /**
   * Resume the game
   */
  resume() {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
    }
  }

  /**
   * End the chapter
   */
  endChapter() {
    this.setState('ENDED');
  }

  /**
   * Get state manager for external access
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * Get asset manager for external access
   */
  getAssetManager(): AssetManager {
    return this.assetManager;
  }

  /**
   * Get effects processor for external access
   */
  getEffectsProcessor(): EffectsProcessor {
    return this.effectsProcessor;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.effectsProcessor.stop();
    await this.assetManager.cleanup();
    this.setState('LOADING');
    this.chapterData = null;
  }
}