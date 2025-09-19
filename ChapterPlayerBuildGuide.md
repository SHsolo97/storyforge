### **Comprehensive Frontend Guide: The Chapter Player Engine**

This document provides a deep dive into the architecture and operation of the frontend Chapter Player. Its purpose is to provide complete clarity for the client-side engineering team.

#### 1. Core Philosophy: An Effects-Based State Machine

The Chapter Player is not a "story reader"; it is a **dumb but powerful Effects Processor**. It knows nothing about the plot, characters, or narrative structure. Its one and only job is to receive a list of instructions (effects) and execute them, one by one, changing the state of the application as it goes.

**Key Principles:**
*   **The `chapter.json` is the program.** The player is the interpreter.
*   **The player is stateless by nature.** All persistent state is managed by a dedicated `StateManager` which holds the `PlayerProgress` object received from the server.
*   **The player is event-driven.** It processes effects, then waits for either an internal event (like a timer) or an external event (like a user tap) to proceed.

#### 2. Core Architectural Components

To manage complexity, the player should be broken down into several distinct, single-responsibility modules or classes:

1.  **`GameManager` (The Orchestrator):**
    *   The high-level controller.
    *   Initiates the chapter loading process by calling the backend API.
    *   Manages the overall game state (e.g., `LOADING`, `PLAYING`, `PAUSED`, `ENDED`).
    *   Tells the `EffectsProcessor` which node to start processing.

2.  **`AssetManager` (The Librarian):**
    *   Responsible for all asset loading and caching.
    *   Parses the `assetManifest` from the `chapter.json`.
    *   Manages the pre-loading screen, downloading all required images and audio.
    *   Provides a simple interface for other components to retrieve a loaded asset by its key (e.g., `AssetManager.getImage('bg_alley_rain')`).

3.  **`StateManager` (The Brain):**
    *   Holds the local, in-memory copy of the `PlayerProgress` document. This is the **single source of truth** for the UI.
    *   Provides methods to update the state in response to effects (`set`, `inc`, `dec`).
    *   Provides methods to read the state for evaluating conditional logic (`when` clauses and `branch` effects).

4.  **`EffectsProcessor` (The Engine Core):**
    *   The workhorse of the player.
    *   Takes a list of effect objects and executes them sequentially.
    *   Handles the distinction between synchronous and asynchronous effects.

5.  **`Renderer` (The Stage - Your React Components):**
    *   A collection of UI components that subscribe to the `StateManager`.
    *   `BackgroundView`: Displays the current background image.
    *   `CharacterView`: Renders character sprites (including the layered "paper doll" MC).
    *   `DialogueView`: Displays dialogue and narration text.
    *   `ChoiceView`: Renders the choice buttons when the game state requires it.
    *   `CGView`: Displays a full-screen headliner image.

#### 3. The Player Lifecycle: From "Play" to "Chapter End"

This is the step-by-step journey of a player session.

**Phase 1: Initialization**
1.  User taps "Play" on a story. The `GameManager` is activated.
2.  If it's the first time, the app follows the **Character Customizer Flow**:
    *   Call `GET /stories/:id` to get the `firstChapter.contentUrl`.
    *   Download the `chapter.json`.
    *   Use the `characterCustomization` block to render the creator UI.
    *   On confirm, call `POST /play/saveCustomization`.
3.  The `GameManager` calls the **`POST /play/startChapter`** API endpoint.
4.  It receives the full `PlayerProgress` document and the final `contentUrl`.
5.  It passes the `PlayerProgress` to the `StateManager` to initialize the local state.
6.  It passes the `contentUrl` to the `AssetManager`.

**Phase 2: Pre-loading**
1.  The `GameManager` sets the game state to `LOADING`. The `Renderer` shows the "Loading Chapter..." screen.
2.  The `AssetManager` downloads the `chapter.json` from the `contentUrl`.
3.  It parses the JSON and reads the `assetManifest`.
4.  It begins downloading all images and audio from the manifest URLs, updating the loading screen's progress bar.
5.  Once all assets are downloaded and cached locally, the `AssetManager` notifies the `GameManager`.

**Phase 3: The Main Game Loop**
1.  The `GameManager` sets the game state to `PLAYING`. The `Renderer` hides the loading screen.
2.  It looks at the `StateManager` for the current `resumeNodeId`.
3.  It tells the `EffectsProcessor` to begin executing the `onEnter` block of that node.
4.  The `EffectsProcessor` runs through the effects. If the last effect is `goto`, the `GameManager` updates its current node ID and tells the `EffectsProcessor` to start on the new node's `onEnter` block. This loop continues until a `choices` block is encountered.

**Phase 4: Player Input (Choices)**
1.  When a node with a `choices` block is reached (after its `onEnter` is complete), the `EffectsProcessor` pauses.
2.  The `GameManager` tells the `Renderer` to display the `ChoiceView`, passing it the `choices` array.
3.  The `ChoiceView` renders the buttons. The client checks the player's diamond balance from the `StateManager` to enable/disable premium choices.
4.  The player taps a choice.
5.  The `GameManager` is notified. It finds the selected choice object and tells the `EffectsProcessor` to execute that choice's `effects` list.
6.  The game loop (Phase 3) resumes.

**Phase 5: Saving Progress**
1.  During the game loop, if the `EffectsProcessor` encounters an `op: "bookmark"` effect, the `GameManager` triggers a background `syncProgress` API call.
2.  If it encounters an `op: "endChapter"` effect, it triggers a final `syncProgress` call and sets the game state to `ENDED`. The `Renderer` shows the "Chapter Complete" screen.
3.  **Error Handling:** If any `syncProgress` call returns a `409 Conflict`, the `GameManager` initiates the **"self-healing"** flow, presenting the user with a modal to accept the server's version of the state.

---

#### 4. Deep Dive: The `EffectsProcessor` Logic

This is the most important component. Its logic should be based on an **effects queue**.

**Pseudo-code:**
```typescript
class EffectsProcessor {
  async execute(effects: Effect[]) {
    for (const effect of effects) {
      // First, evaluate any 'when' conditions
      if (effect.when && !StateManager.evaluateConditions(effect.when)) {
        continue; // Skip this effect
      }

      // Process the effect based on its 'op' code
      switch (effect.op) {
        // --- SYNCHRONOUS EFFECTS (Instant) ---
        case 'set':
        case 'inc':
        case 'dec':
          StateManager.updateVariable(effect.args.var, effect.args.value);
          break;
        case 'bookmark':
          GameManager.triggerSync(); // Fire-and-forget
          break;

        // --- ASYNCHRONOUS EFFECTS (Wait for completion) ---
        case 'dialogue':
        case 'narration':
          await Renderer.DialogueView.showText(effect.args.text); // Waits for user tap
          break;
        case 'bg':
          await Renderer.BackgroundView.transitionTo(effect.args.imageKey); // Waits for fade
          break;
        case 'character':
          await Renderer.CharacterView.process(effect.args); // Waits for fade-in/out
          break;
        case 'showCG':
          await Renderer.CGView.show(effect.args.imageKey); // Waits for user tap
          break;
        case 'sfx':
          AssetManager.playSound(effect.args.srcKey); // Fire-and-forget, no await needed
          break;
        
        // --- FLOW CONTROL (Stops this queue and starts a new one) ---
        case 'goto':
          GameManager.setCurrentNode(effect.args.target);
          return; // Exit the current loop
        case 'branch':
          const targetNode = StateManager.evaluateBranch(effect.args);
          GameManager.setCurrentNode(targetNode);
          return; // Exit the current loop
        case 'endChapter':
          GameManager.endChapter();
          return; // Exit the current loop
      }
    }
  }
}
```

---

#### 5. Deep Dive: The `Renderer`'s Character Logic

The `CharacterView` needs special logic for the MC.

1.  When it receives an instruction to render a character, it first checks the `characterKey`.
2.  **If `characterKey` is NOT `mc`:** It's a standard NPC. It looks up the character's *current* outfit from `StateManager.variables.outfit` (or defaults to `"default"`) and combines it with the `emotion` from the effect's args to build the asset key (e.g., `jax_default_angry`).
3.  **If `characterKey` IS `mc`:** This is the layered "paper doll".
    *   It queries the `StateManager.variables.customization.mc` object to get all the chosen part IDs (`face`, `hair`, `outfit`, etc.).
    *   It constructs the asset key for **each layer separately**.
    *   Crucially, the `emotion` from the effect's `args` is **only** used to construct the `face` layer's asset key (e.g., `mc_face_f02_happy`).
    *   It then renders these multiple, pre-loaded images as layers in the correct Z-order.

This comprehensive guide provides your frontend team with the architectural principles, component responsibilities, and detailed logical flows required to build a robust, performant, and feature-rich Chapter Player.