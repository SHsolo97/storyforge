import { Effect } from './types';
import { StateManager } from './StateManager';
import { AssetManager } from './AssetManager';

/**
 * EffectsProcessor - The Engine Core
 * Takes a list of effect objects and executes them sequentially.
 * Handles the distinction between synchronous and asynchronous effects.
 */
export class EffectsProcessor {
  private stateManager: StateManager;
  private assetManager: AssetManager;
  private isProcessing = false;
  private currentPromise: Promise<void> | null = null;

  // Event handlers for UI updates
  public onBackgroundChange?: (imageKey: string, transition?: string) => Promise<void>;
  public onCharacterAction?: (args: any) => Promise<void>;
  public onDialogue?: (character: string, text: string) => Promise<void>;
  public onNarration?: (text: string) => Promise<void>;
  public onShowCG?: (imageKey: string) => Promise<void>;
  public onEffectComplete?: () => void;
  public onNodeComplete?: (nextNodeId?: string) => void;

  constructor(stateManager: StateManager, assetManager: AssetManager) {
    this.stateManager = stateManager;
    this.assetManager = assetManager;
  }

  /**
   * Execute a list of effects sequentially
   */
  async execute(effects: Effect[]): Promise<void> {
    if (this.isProcessing) {
      console.warn('EffectsProcessor is already processing effects');
      return;
    }

    this.isProcessing = true;
    
    try {
      for (const effect of effects) {
        // First, evaluate any 'when' conditions
        if (effect.when && !this.stateManager.evaluateConditions(effect.when)) {
          continue; // Skip this effect
        }

        await this.processEffect(effect);
      }
    } finally {
      this.isProcessing = false;
      this.onEffectComplete?.();
    }
  }

  /**
   * Process a single effect based on its 'op' code
   */
  private async processEffect(effect: Effect): Promise<void> {
    const { op, args } = effect;

    switch (op) {
      // --- SYNCHRONOUS EFFECTS (Instant) ---
      case 'set':
        this.stateManager.setVariable(args.var, args.value);
        break;
        
      case 'inc':
        this.stateManager.incrementVariable(args.var, args.value || 1);
        break;
        
      case 'dec':
        this.stateManager.decrementVariable(args.var, args.value || 1);
        break;
        
      case 'bookmark':
        // Fire-and-forget sync trigger - would normally call API
        console.log('Bookmark triggered - would sync progress to server');
        break;

      // --- ASYNCHRONOUS EFFECTS (Wait for completion) ---
      case 'dialogue':
        console.log(`[EffectsProcessor] Processing dialogue: ${args.character} - ${args.text}`);
        if (this.onDialogue) {
          console.log(`[EffectsProcessor] Calling onDialogue handler`);
          await this.onDialogue(args.character, args.text);
          console.log(`[EffectsProcessor] Dialogue completed`);
        } else {
          console.warn(`[EffectsProcessor] onDialogue handler not set!`);
        }
        break;
        
      case 'narration':
        console.log(`[EffectsProcessor] Processing narration: ${args.text}`);
        if (this.onNarration) {
          console.log(`[EffectsProcessor] Calling onNarration handler`);
          await this.onNarration(args.text);
          console.log(`[EffectsProcessor] Narration completed`);
        } else {
          console.warn(`[EffectsProcessor] onNarration handler not set!`);
        }
        break;
        
      case 'bg':
        console.log(`[EffectsProcessor] Processing background change: ${args.imageKey}, transition: ${args.transition}`);
        if (this.onBackgroundChange) {
          console.log(`[EffectsProcessor] Calling onBackgroundChange handler`);
          await this.onBackgroundChange(args.imageKey, args.transition);
        } else {
          console.warn(`[EffectsProcessor] onBackgroundChange handler not set!`);
        }
        break;
        
      case 'character':
        console.log(`[EffectsProcessor] Processing character action:`, args);
        if (this.onCharacterAction) {
          console.log(`[EffectsProcessor] Calling onCharacterAction handler`);
          await this.onCharacterAction(args);
        } else {
          console.warn(`[EffectsProcessor] onCharacterAction handler not set!`);
        }
        break;
        
      case 'showCG':
        if (this.onShowCG) {
          await this.onShowCG(args.imageKey);
        }
        break;
        
      case 'sfx':
        // Fire-and-forget, no await needed but add error handling
        try {
          this.assetManager.playSound(args.srcKey);
        } catch (error) {
          console.warn(`Sound effect error for ${args.srcKey}:`, error);
          // Continue processing even if sound fails
        }
        break;
        
      case 'music':
        try {
          if (args.action === 'play') {
            await this.assetManager.playMusic(args.srcKey, args.loop);
          } else if (args.action === 'stop') {
            await this.assetManager.stopMusic(args.srcKey);
          }
        } catch (error) {
          console.warn(`Music playback error for ${args.srcKey}:`, error);
          // Continue processing even if music fails
        }
        break;

      // --- FLOW CONTROL (Stops this queue and starts a new one) ---
      case 'goto':
        console.log(`[EffectsProcessor] Processing goto: ${args.target}`);
        this.stateManager.setCurrentNode(args.target);
        console.log(`[EffectsProcessor] Node changed to ${args.target}, notifying GameManager immediately`);
        // Clear the processing flag before triggering node change to allow new processing
        this.isProcessing = false;
        // Immediately notify the GameManager about the node change without delay
        this.onNodeComplete?.(args.target);
        return; // Exit the current loop
        
      case 'branch':
        const targetNode = this.stateManager.evaluateBranch(args as { conditions: Array<{ when: any[], target: string }>, default?: string });
        this.stateManager.setCurrentNode(targetNode);
        // Clear the processing flag before triggering node change to allow new processing
        this.isProcessing = false;
        // Immediately notify the GameManager about the node change
        this.onNodeComplete?.(targetNode);
        return; // Exit the current loop
        
      case 'endChapter':
        console.log('Chapter ended - would trigger final sync and end screen');
        // Clear the processing flag before triggering node change to allow new processing
        this.isProcessing = false;
        // Immediately notify the GameManager
        this.onNodeComplete?.();
        return; // Exit the current loop

      // --- VISUAL EFFECTS ---
      case 'vfx':
        // Handle visual effects like rumble, flash, etc.
        console.log(`Visual effect: ${args.type || 'unknown'}`);
        // Could trigger screen shake, flash, etc.
        break;

      default:
        console.warn(`Unknown effect operation: ${op}`);
    }
  }

  /**
   * Check if the processor is currently executing effects
   */
  isExecuting(): boolean {
    return this.isProcessing;
  }

  /**
   * Stop current execution (for emergencies)
   */
  stop(): void {
    this.isProcessing = false;
    this.currentPromise = null;
  }
}