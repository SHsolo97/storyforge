/**
 * Asset mapping for React Native and Web
 * Maps asset keys to require() statements for mobile platforms
 */

import { Platform } from 'react-native';

// For mobile platforms, we'll use a dynamic require approach
// For web, we'll return null to use the URL-based approach in AssetManager

/**
 * Get background image for the given key
 */
export function getBackgroundImage(key: string): any {
  if (Platform.OS === 'web') {
    return null; // Let AssetManager handle web URLs
  }
  
  // For React Native, try to resolve the asset dynamically
  try {
    switch (key) {
      case 'bg_suburban_street':
        return require('../assets/generated_images/backgrounds/bg_suburban_street.jpg');
      case 'bg_bennets_field_night':
        return require('../assets/generated_images/backgrounds/bg_bennets_field_night.jpg');
      case 'bg_carnival_gate_night':
        return require('../assets/generated_images/backgrounds/bg_carnival_gate_night.jpg');
      case 'bg_carnival_midway_dark':
        return require('../assets/generated_images/backgrounds/bg_carnival_midway_dark.jpg');
      case 'bg_carnival_midway_lit':
        return require('../assets/generated_images/backgrounds/bg_carnival_midway_lit.jpg');
      case 'bg_haunted_house_exterior':
        return require('../assets/generated_images/backgrounds/bg_haunted_house_exterior.jpg');
      case 'bg_wheel_of_no_chance':
        return require('../assets/generated_images/backgrounds/bg_wheel_of_no_chance.jpg');
      case 'bg_prize_room':
        return require('../assets/generated_images/backgrounds/bg_prize_room.jpg');
      case 'bg_mars_weight_game':
        return require('../assets/generated_images/backgrounds/bg_mars_weight_game.jpg');
      case 'bg_planet_chamber':
        return require('../assets/generated_images/backgrounds/bg_planet_chamber.jpg');
      case 'bg_freak_show_alley':
        return require('../assets/generated_images/backgrounds/bg_freak_show_alley.jpg');
      case 'bg_freak_show_prison':
        return require('../assets/generated_images/backgrounds/bg_freak_show_prison.jpg');
      case 'bg_fortune_teller_tent':
        return require('../assets/generated_images/backgrounds/bg_fortune_teller_tent.jpg');
      case 'bg_space_coaster_tunnel':
        return require('../assets/generated_images/backgrounds/bg_space_coaster_tunnel.jpg');
      case 'bg_space_coaster_dark_tunnel':
        return require('../assets/generated_images/backgrounds/bg_space_coaster_dark_tunnel.jpg');
      case 'bg_house_of_horrors_bridge':
        return require('../assets/generated_images/backgrounds/bg_house_of_horrors_bridge.jpg');
      case 'bg_house_of_horrors_interior':
        return require('../assets/generated_images/backgrounds/bg_house_of_horrors_interior.jpg');
      case 'bg_mirror_room':
        return require('../assets/generated_images/backgrounds/bg_mirror_room.jpg');
      case 'bg_dr_stone_lab':
        return require('../assets/generated_images/backgrounds/bg_dr_stone_lab.jpg');
      case 'bg_booger_bog_swamp':
        return require('../assets/generated_images/backgrounds/bg_booger_bog_swamp.jpg');
      case 'bg_reptile_zoo':
        return require('../assets/generated_images/backgrounds/bg_reptile_zoo.jpg');
      case 'bg_pond':
        return require('../assets/generated_images/backgrounds/bg_pond.jpg');
      case 'bg_dummy_tent':
        return require('../assets/generated_images/backgrounds/bg_dummy_tent.jpg');
      case 'bg_hall_of_mountain_king_interior':
        return require('../assets/generated_images/backgrounds/bg_hall_of_mountain_king_interior.jpg');
      case 'bg_log_flume_ride':
        return require('../assets/generated_images/backgrounds/bg_log_flume_ride.jpg');
      case 'bg_final_challenge_tent':
        return require('../assets/generated_images/backgrounds/bg_final_challenge_tent.jpg');
      case 'bg_vulture_nest':
        return require('../assets/generated_images/backgrounds/bg_vulture_nest.jpg');
      default:
        return null;
    }
  } catch (error) {
    console.warn(`[AssetMapping] Failed to load background image ${key}:`, error);
    return null;
  }
}

/**
 * Get character image for the given key
 */
export function getCharacterImage(key: string): any {
  if (Platform.OS === 'web') {
    return null; // Let AssetManager handle web URLs
  }
  
  // For React Native, try to resolve the asset dynamically
  try {
    switch (key) {
      case 'patty_default_neutral':
        return require('../assets/generated_images/characters/patty_default_neutral.png');
      case 'patty_default_annoyed':
        return require('../assets/generated_images/characters/patty_default_annoyed.png');
      case 'patty_default_excited':
        return require('../assets/generated_images/characters/patty_default_excited.png');
      case 'patty_default_scared':
        return require('../assets/generated_images/characters/patty_default_scared.png');
      case 'brad_default_neutral':
        return require('../assets/generated_images/characters/brad_default_neutral.png');
      case 'brad_default_nervous':
        return require('../assets/generated_images/characters/brad_default_nervous.png');
      case 'brad_default_scared':
        return require('../assets/generated_images/characters/brad_default_scared.png');
      case 'big_al_default_neutral':
        return require('../assets/generated_images/characters/big_al_default_neutral.png');
      case 'big_al_default_menacing':
        return require('../assets/generated_images/characters/big_al_default_menacing.png');
      case 'big_al_default_grinning':
        return require('../assets/generated_images/characters/big_al_default_grinning.png');
      case 'parrot_default_neutral':
        return require('../assets/generated_images/characters/parrot_default_neutral.png');
      case 'parrot_default_vulture':
        return require('../assets/generated_images/characters/parrot_default_vulture.png');
      case 'madame_zeno_default_mysterious':
        return require('../assets/generated_images/characters/madame_zeno_default_mysterious.png');
      case 'madame_zeno_default_trance':
        return require('../assets/generated_images/characters/madame_zeno_default_trance.png');
      case 'snake_lady_default_neutral':
        return require('../assets/generated_images/characters/snake_lady_default_neutral.png');
      case 'giant_default_sad':
        return require('../assets/generated_images/characters/giant_default_sad.png');
      case 'giant_default_angry':
        return require('../assets/generated_images/characters/giant_default_angry.png');
      case 'giant_default_crying':
        return require('../assets/generated_images/characters/giant_default_crying.png');
      case 'dr_stone_default_evil':
        return require('../assets/generated_images/characters/dr_stone_default_evil.png');
      case 'monster_horned_default_neutral':
        return require('../assets/generated_images/characters/monster_horned_default_neutral.png');
      case 'monster_alligator_default_neutral':
        return require('../assets/generated_images/characters/monster_alligator_default_neutral.png');
      case 'dummy_default_lifeless':
        return require('../assets/generated_images/characters/dummy_default_lifeless.png');
      case 'dummy_default_alive':
        return require('../assets/generated_images/characters/dummy_default_alive.png');
      default:
        return null;
    }
  } catch (error) {
    console.warn(`[AssetMapping] Failed to load character image ${key}:`, error);
    return null;
  }
}

/**
 * Get audio asset for the given key
 */
export function getAudioAsset(key: string): any {
  if (Platform.OS === 'web') {
    return null; // Let AssetManager handle web URLs
  }
  
  // For React Native, try to resolve the asset dynamically
  try {
    switch (key) {
      case 'music_intro':
        return require('../assets/audio/90s_Spooky_Night_Synthwave_Intro.mp3');
      case 'music_suspense':
        return require('../assets/audio/What Big Al Says.mp3');
      case 'music_strange_carnival':
        return require('../assets/audio/Last Week of August.mp3');
      case 'music_chase':
        return require('../assets/audio/What Big Al Says (1).mp3');
      case 'music_horror_reveal':
        return require('../assets/audio/Last Week of August (1).mp3');
      case 'music_creepy_ambient':
        return require('../assets/audio/The Humming Fence.mp3');
      default:
        return null;
    }
  } catch (error) {
    console.warn(`[AssetMapping] Failed to load audio asset ${key}:`, error);
    return null;
  }
}

/**
 * Check if background image exists
 */
export function hasBackgroundImage(key: string): boolean {
  return getBackgroundImage(key) !== null;
}

/**
 * Check if character image exists
 */
export function hasCharacterImage(key: string): boolean {
  return getCharacterImage(key) !== null;
}

/**
 * Check if audio asset exists
 */
export function hasAudioAsset(key: string): boolean {
  return getAudioAsset(key) !== null;
}