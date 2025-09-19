import { Image } from 'expo-image';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { AssetManifest } from './types';
import { getBackgroundImage, getCharacterImage, getAudioAsset, hasBackgroundImage, hasCharacterImage, hasAudioAsset } from '../assetMapping';

/**
 * AssetManager - The Librarian
 * Responsible for all asset loading and caching.
 */
export class AssetManager {
  private images: Map<string, any> = new Map();
  private sounds: Map<string, Audio.Sound> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  private listeners: Set<(progress: number) => void> = new Set();
  private totalAssets = 0;
  private loadedAssets = 0;
  
  // Track currently playing music for proper cleanup
  private currentMusic: string | null = null;

  /**
   * Subscribe to loading progress updates
   */
  onProgress(listener: (progress: number) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of progress changes
   */
  private notifyProgress() {
    const progress = this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
    this.listeners.forEach(listener => listener(progress));
  }

  /**
   * Load all assets from the manifest
   */
  async loadAssets(manifest: AssetManifest): Promise<void> {
    console.log('[AssetManager] Starting to load assets from manifest:', manifest);
    
    // Calculate total number of assets
    this.totalAssets = 0;
    this.loadedAssets = 0;
    
    // Count images
    this.totalAssets += Object.keys(manifest.images).length;
    console.log(`[AssetManager] Found ${Object.keys(manifest.images).length} background images`);
    
    // Count character images
    Object.values(manifest.characters).forEach(character => {
      Object.values(character).forEach(emotion => {
        this.totalAssets += Object.keys(emotion).length;
      });
    });
    console.log(`[AssetManager] Total character images: ${this.totalAssets - Object.keys(manifest.images).length}`);
    
    // Count audio files
    this.totalAssets += Object.keys(manifest.audio).length;
    console.log(`[AssetManager] Found ${Object.keys(manifest.audio).length} audio files`);
    console.log(`[AssetManager] Total assets to load: ${this.totalAssets}`);

    const promises: Promise<void>[] = [];

    // Load images
    console.log('[AssetManager] Loading background images...');
    for (const [key, url] of Object.entries(manifest.images)) {
      promises.push(this.loadImage(key, url));
    }

    // Load character images
    console.log('[AssetManager] Loading character images...');
    for (const [characterKey, character] of Object.entries(manifest.characters)) {
      console.log(`[AssetManager] Processing character: ${characterKey}`);
      for (const [emotionKey, emotion] of Object.entries(character)) {
        console.log(`[AssetManager] Processing emotion: ${emotionKey} for character: ${characterKey}`);
        for (const [outfitKey, url] of Object.entries(emotion)) {
          const assetKey = `${characterKey}_${outfitKey}_${emotionKey}`;
          console.log(`[AssetManager] Queuing character image load: ${assetKey} from ${url}`);
          promises.push(this.loadCharacterImage(assetKey, url));
        }
      }
    }

    // Load audio files
    for (const [key, url] of Object.entries(manifest.audio)) {
      promises.push(this.loadAudio(key, url));
    }

    // Wait for all assets to attempt loading (but don't fail if some fail)
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some assets failed to load, but continuing:', error);
    }
    
    // Force progress to 100% even if some assets failed
    this.loadedAssets = this.totalAssets;
    this.notifyProgress();
  }

  /**
   * Load and cache a character image
   */
  private async loadCharacterImage(key: string, url: string): Promise<void> {
    console.log(`[AssetManager] Loading character image: ${key} from ${url}, Platform: ${Platform.OS}`);
    
    if (this.images.has(key)) {
      console.log(`[AssetManager] Character image ${key} already cached`);
      return;
    }

    // Prevent duplicate loading
    if (this.loadingPromises.has(key)) {
      console.log(`[AssetManager] Character image ${key} already loading`);
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        if (Platform.OS === 'web') {
          // For web, use Metro's asset serving format
          console.log(`[AssetManager] Web platform - using Metro asset path for character: ${url}`);
          const assetPath = url.replace('../', './');
          const imageUrl = `/assets/?unstable_path=${encodeURIComponent(assetPath)}`;
          console.log(`[AssetManager] Metro character asset URL: ${imageUrl}`);
          this.images.set(key, imageUrl);
          this.loadedAssets++;
          this.notifyProgress();
          return;
        } else {
          // For React Native, try to get the character image from asset mapping
          console.log(`[AssetManager] Native platform - attempting to get character ${key} from asset mapping`);
          const assetImage = getCharacterImage(key);
          if (assetImage) {
            console.log(`[AssetManager] Successfully got character ${key} from asset mapping:`, assetImage);
            this.images.set(key, assetImage);
            this.loadedAssets++;
            this.notifyProgress();
            return;
          } else {
            console.warn(`[AssetManager] Character image not found in mapping: ${key}`);
          }
        }

        // Fallback: log warning and continue
        console.warn(`Character image asset not found in mapping: ${key}`);
        this.loadedAssets++;
        this.notifyProgress();
      } catch (error) {
        console.warn(`Failed to load character image ${key}:`, error);
        this.loadedAssets++;
        this.notifyProgress();
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  /**
   * Load and cache an image
   */
  private async loadImage(key: string, url: string): Promise<void> {
    console.log(`[AssetManager] Loading image: ${key} from ${url}, Platform: ${Platform.OS}`);
    
    if (this.images.has(key)) {
      console.log(`[AssetManager] Image ${key} already cached`);
      return;
    }

    // Prevent duplicate loading
    if (this.loadingPromises.has(key)) {
      console.log(`[AssetManager] Image ${key} already loading`);
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        if (Platform.OS === 'web') {
          // For web, use Metro's asset serving format
          console.log(`[AssetManager] Web platform - using Metro asset path for: ${url}`);
          // Convert to Metro asset URL format
          const assetPath = url.replace('../', './');
          const imageUrl = `/assets/?unstable_path=${encodeURIComponent(assetPath)}`;
          console.log(`[AssetManager] Metro asset URL: ${imageUrl}`);
          this.images.set(key, imageUrl);
          this.loadedAssets++;
          this.notifyProgress();
          return;
        } else {
          // For React Native, try to get the image from asset mapping first
          console.log(`[AssetManager] Native platform - attempting to get background ${key} from asset mapping`);
          const assetImage = getBackgroundImage(key);
          if (assetImage) {
            console.log(`[AssetManager] Successfully got background ${key} from asset mapping:`, assetImage);
            this.images.set(key, assetImage);
            this.loadedAssets++;
            this.notifyProgress();
            return;
          } else {
            console.warn(`[AssetManager] Background image not found in mapping: ${key}`);
          }
        }

        // Fallback: log warning and continue
        console.warn(`Image asset not found in mapping: ${key}`);
        this.loadedAssets++;
        this.notifyProgress();
      } catch (error) {
        console.warn(`Failed to load image ${key}:`, error);
        this.loadedAssets++;
        this.notifyProgress();
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  /**
   * Preload an image using expo-image
   */
  private async preloadImage(url: string): Promise<void> {
    try {
      // Handle asset folder paths
      if (url.startsWith('../assets/')) {
        // Convert relative path to require() compatible path
        const assetPath = url.replace('../assets/', './assets/');
        console.log(`Loading asset from: ${assetPath}`);
        // For now, we'll skip preloading but store the path
        // In a production app, you'd use require() or import for assets
        return Promise.resolve();
      }
      
      // For external URLs, use prefetch
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await Image.prefetch(url);
        return;
      }
      
      // Skip other local paths
      console.log(`Skipping preload for local path: ${url}`);
      return Promise.resolve();
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
      // Don't throw - allow the game to continue
    }
  }

  /**
   * Load and cache an audio file
   */
  private async loadAudio(key: string, url: string): Promise<void> {
    if (this.sounds.has(key)) {
      return;
    }

    // Prevent duplicate loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        if (Platform.OS === 'web') {
          // For web, create HTML Audio elements for basic playback
          console.log(`[AssetManager] Web - loading audio for ${key} from ${url}`);
          const assetPath = url.replace('../', './');
          const audioUrl = `/assets/?unstable_path=${encodeURIComponent(assetPath)}`;
          console.log(`[AssetManager] Metro audio asset URL: ${audioUrl}`);
          
          // Create a mock sound object with HTML Audio for web
          const webSound = {
            audio: new (globalThis as any).Audio(audioUrl),
            isLooping: false,
            async replayAsync() {
              this.audio.currentTime = 0;
              return this.audio.play();
            },
            async playAsync() {
              return this.audio.play();
            },
            async stopAsync() {
              this.audio.pause();
              this.audio.currentTime = 0;
            },
            async setIsLoopingAsync(loop: boolean) {
              this.isLooping = loop;
              this.audio.loop = loop;
            },
            async unloadAsync() {
              this.audio.pause();
              this.audio.src = '';
            }
          };
          
          this.sounds.set(key, webSound as any);
          this.loadedAssets++;
          this.notifyProgress();
          return;
        }

        // For React Native, try to get audio from asset mapping
        const audioAsset = getAudioAsset(key);
        if (audioAsset) {
          const { sound } = await Audio.Sound.createAsync(audioAsset);
          this.sounds.set(key, sound);
          this.loadedAssets++;
          this.notifyProgress();
          return;
        }

        // Handle asset folder paths
        if (url.startsWith('../assets/audio/')) {
          console.log(`Skipping audio load for asset path: ${url}`);
          this.loadedAssets++;
          this.notifyProgress();
          return;
        }

        // Skip other local paths
        if (url.startsWith('./') || url.startsWith('../')) {
          console.log(`Skipping audio load for local path: ${url}`);
          this.loadedAssets++;
          this.notifyProgress();
          return;
        }

        // Load external URLs
        if (url.startsWith('http://') || url.startsWith('https://')) {
          const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: false });
          this.sounds.set(key, sound);
        }

        this.loadedAssets++;
        this.notifyProgress();
      } catch (error) {
        console.warn(`Failed to load audio ${key}:`, error);
        this.loadedAssets++;
        this.notifyProgress();
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  /**
   * Get a cached image (returns require() result for React Native)
   */
  getImage(key: string): any {
    return this.images.get(key);
  }

  /**
   * Get a cached sound
   */
  getSound(key: string): Audio.Sound | undefined {
    return this.sounds.get(key);
  }

  /**
   * Play a sound effect
   */
  async playSound(key: string): Promise<void> {
    const sound = this.getSound(key);
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.warn(`Failed to play sound ${key}:`, error);
      }
    } else {
      console.warn(`Sound not found: ${key}`);
    }
  }

  /**
   * Play background music with looping
   */
  async playMusic(key: string, loop: boolean = true): Promise<void> {
    // Stop any currently playing music first
    if (this.currentMusic && this.currentMusic !== key) {
      console.log(`[AssetManager] Stopping current music: ${this.currentMusic}`);
      await this.stopMusic(this.currentMusic);
    }

    const sound = this.getSound(key);
    if (sound) {
      try {
        await sound.setIsLoopingAsync(loop);
        await sound.playAsync();
        this.currentMusic = key;
        console.log(`[AssetManager] Started playing music: ${key}`);
      } catch (error) {
        console.warn(`Failed to play music ${key}:`, error);
      }
    } else {
      console.warn(`Music not found: ${key}`);
    }
  }

  /**
   * Stop background music
   */
  async stopMusic(key: string): Promise<void> {
    const sound = this.getSound(key);
    if (sound) {
      try {
        await sound.stopAsync();
        if (this.currentMusic === key) {
          this.currentMusic = null;
        }
        console.log(`[AssetManager] Stopped music: ${key}`);
      } catch (error) {
        console.warn(`Failed to stop music ${key}:`, error);
      }
    }
  }

  /**
   * Stop all currently playing music
   */
  async stopAllMusic(): Promise<void> {
    if (this.currentMusic) {
      await this.stopMusic(this.currentMusic);
    }
  }

  /**
   * Build character asset key from components
   */
  buildCharacterKey(characterKey: string, outfit: string, emotion: string): string {
    return `${characterKey}_${outfit}_${emotion}`;
  }

  /**
   * Get character image with fallback to default
   */
  getCharacterImage(characterKey: string, outfit: string, emotion: string): any {
    const key = this.buildCharacterKey(characterKey, outfit, emotion);
    let image = this.getImage(key);
    
    // Fallback to neutral emotion if specific emotion not found
    if (!image && emotion !== 'neutral') {
      const neutralKey = this.buildCharacterKey(characterKey, outfit, 'neutral');
      image = this.getImage(neutralKey);
    }
    
    return image;
  }

  /**
   * Get current loading progress (0-1)
   */
  getProgress(): number {
    return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
  }

  /**
   * Check if all assets are loaded
   */
  isLoaded(): boolean {
    return this.loadedAssets >= this.totalAssets && this.totalAssets > 0;
  }

  /**
   * Clear all cached assets
   */
  async cleanup(): Promise<void> {
    // Unload all sounds
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Error unloading sound:', error);
      }
    }
    
    this.images.clear();
    this.sounds.clear();
    this.loadingPromises.clear();
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }
}