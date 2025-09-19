# Interactive Stories App - Project Overview

This document provides a comprehensive overview of the Interactive Stories mobile application, including its structure, components, and overall architecture.

## Project Purpose

The Interactive Stories app is a mobile application built with React Native and Expo that allows users to read and interact with stories. The app features a character creator, a library of stories, and a store for in-app purchases.

## Core Technologies

*   **React Native**: A JavaScript framework for building native mobile apps.
*   **Expo**: A platform for making universal React applications. It provides a set of tools and services built around React Native and native platforms that help you develop, build, deploy, and quickly iterate on iOS, Android, and web apps from the same JavaScript/TypeScript codebase.
*   **Expo Router**: A file-based router for React Native and web applications. It allows you to define your app's navigation structure using files and directories.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript. It helps in building more robust and maintainable applications.

## Project Structure

The project is organized into the following directories:

*   `app/`: Contains all the screens and navigation logic of the application, using Expo's file-based routing.
    *   `_layout.tsx`: The root layout of the app.
    *   `+not-found.tsx`: A screen to handle routes that are not found.
    *   `character-creator.tsx`: The screen for creating a character.
    *   `(tabs)/`: A directory that defines a tab-based navigation.
        *   `_layout.tsx`: The layout for the tabs.
        *   `index.tsx`: The home screen of the app.
        *   `library.tsx`: The screen that displays the user's story library.
        *   `profile.tsx`: The user's profile screen.
        *   `store.tsx`: The in-app store.
    *   `story/`: A directory for the story reading experience.
        *   `[id].tsx`: A dynamic route that displays a story based on its ID.
*   `assets/`: Contains static assets like images and fonts.
*   `components/`: Contains reusable React components used throughout the application.
*   `constants/`: Contains constant values, such as colors and styles.
*   `data/`: Contains static data used in the app, such as story information and chapter content.
*   `hooks/`: Contains custom React hooks.

## Key Files

*   `package.json`: Lists the project's dependencies and scripts.
*   `app.json`: The configuration file for the Expo app.
*   `tsconfig.json`: The configuration file for the TypeScript compiler.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```

This will start the Expo development server and allow you to run the app on a simulator or a physical device.

## Implementation Details

### `app/_layout.tsx` - Root Layout

The root layout is the main entry point of the app's UI.

-   **Font Loading**: It uses `@expo-google-fonts` to load the `Lora` and `Montserrat` font families. The `useFonts` hook returns a boolean `fontsLoaded` which is true when the fonts are ready.
-   **Splash Screen Management**: The `SplashScreen.preventAutoHideAsync()` function is called to keep the splash screen visible while the app is loading. Once the fonts are loaded (or if there's an error), `SplashScreen.hideAsync()` is called inside a `useCallback` to hide it. This ensures a smooth transition from the splash screen to the app.
-   **Root Navigation**: It sets up a `Stack` navigator from `expo-router`. The main content is the `(tabs)` layout. It also defines a `+not-found` screen for handling any invalid URLs. The `headerShown: false` option is used to hide the default header for the stack navigator, as custom headers are implemented within the screens themselves.

### `app/(tabs)/_layout.tsx` - Tabs Layout

This file configures the main tab bar navigation for the app.

-   **Tabs Navigator**: It uses the `Tabs` component from `expo-router` to create the bottom tab bar.
-   **Custom Styling**: The `tabBarStyle` is customized to set the background color, add a top border, and adjust the height to accommodate the safe area insets at the bottom of the screen (`insets.bottom`).
-   **Tab Screens**: It defines four tabs: Home, Library, Store, and Profile.
    -   Each tab has a `title` and an `icon`. The icons are from the `lucide-react-native` library. The color of the icon is dynamically set based on whether the tab is active or not.
-   **Shared Header Components**: A `headerRight` component is defined in `screenOptions`, which places the `DiamondCounter` and `TicketCounter` components in the header of all tab screens. This is a convenient way to have a consistent header across multiple screens.

### `app/(tabs)/index.tsx` - Home Screen

This is the main landing screen of the app.

-   **Data Fetching**: It uses functions from `data/storiesData.ts` (`getFeaturedStories`, `getRecentlyUpdated`, `getStoriesByGenre`) to get the story data to display.
-   **State Management**: It uses `useState` to manage the `selectedGenre` and the list of `genreStories`. An `useEffect` hook is used to update the `genreStories` whenever the `selectedGenre` changes.
-   **Featured Stories Carousel**: A horizontal `FlatList` is used to display the featured stories.
    -   `snapToInterval` and `decelerationRate` are used to create a snapping effect, making the carousel feel more polished.
    -   Each item in the carousel is an `Animated.View` with a `FadeInRight` animation from `react-native-reanimated`, creating a staggered animation effect.
-   **Genre Selection**: It renders a horizontal `ScrollView` of `GenreButton` components, allowing the user to filter the stories by genre.
-   **Navigation**: The `useRouter` hook is used to get the router object, and `router.push` is called to navigate to the story screen when a story card is pressed.

### `app/(tabs)/library.tsx` - Library Screen

This screen displays the stories the user is currently reading or has completed.

-   **Tabbed Interface**: It uses `useState` to manage the `activeTab` ('current' or 'completed'). The UI changes based on the active tab.
-   **Data Filtering**: It fetches all user stories using `getUserStories` and then filters them into `currentStories` and `completedStories` based on the `progress` property.
-   **Story List**: A `FlatList` is used to display the list of stories. The `StoryCard` component is used for each item, with the `showProgress` prop set to `true`.
-   **Empty State**: If there are no stories in a particular tab, it displays a message with an icon, and a "Browse Stories" button to encourage the user to discover new content.

### `app/(tabs)/profile.tsx` - Profile Screen

This screen shows the user's profile information, stats, and settings.

-   **UI Structure**: It uses a `ScrollView` to display the content. The layout is divided into sections: profile info (avatar, name), stats, and settings.
-   **Animations**: `react-native-reanimated` is used to apply `FadeIn` and `FadeInDown` animations to the different sections, making the screen appear more dynamic.
-   **Static Data**: The user data is currently hardcoded. In a real application, this would be fetched from a backend service.
-   **Component Reusability**: It uses the `DiamondCounter` component to display the user's diamond balance.

### `app/(tabs)/store.tsx` - Store Screen

This screen allows users to purchase in-app currency (diamonds and tickets).

-   **Data Structure**: The available packages (diamonds, tickets, combos, book passes) are defined as constant arrays of objects at the top of the file.
-   **Tabbed View**: Similar to the Library screen, it uses `useState` to manage which category of items is currently being viewed.
-   **Dynamic Rendering**: The UI renders different lists of items based on the `activeTab`. A `renderPackageItem` function is used to render the diamond and ticket packages, as they share a similar structure.
-   **UI Details**: It includes "Best Value" badges for popular packages and shows bonus amounts, which are common strategies to incentivize larger purchases.

### `app/character-creator.tsx` - Character Creator

This screen is where the user can customize their character before starting a story.

-   **Customization Options**: The available avatars and personalities are defined as constant arrays.
-   **State Management**: `useState` is used to keep track of the selected avatar and personality.
-   **UI Feedback**: The selected option for both avatar and personality is highlighted with a different style (e.g., a border color), providing clear visual feedback to the user.
-   **Navigation**: After making their selections, the user presses the "Begin Your Story" button, which calls `router.push` to navigate to the first chapter of the story.

### `app/story/[id].tsx` - Story Screen

This is the most complex and interactive part of the application. It's responsible for displaying the story content and handling user choices.

-   **Dynamic Routing**: It uses `useLocalSearchParams` from `expo-router` to get the `id` of the story, the `chapterId`, and the `sceneId` from the URL. This allows the component to display the correct content for any part of any story.
-   **Data-Driven UI**: The entire screen is driven by the data fetched from `storiesData.ts`. It gets the current story, chapter, and scene objects.
-   **Scene Types**: The UI changes based on the `type` of the `currentScene`:
    -   `narrative`: Displays a block of text.
    -   `dialogue`: Displays text along with a character's name and image.
    -   `choice`: Displays a question and a list of choices for the user to select.
-   **Timed Choices**: For scenes with `timed: true`, a timer is initiated.
    -   `useEffect` is used to manage the `setInterval` for the countdown.
    -   If the timer reaches zero before the user makes a choice, a default choice (usually the first one) is automatically selected.
-   **Choice Handling**: When a user selects a choice:
    -   The `choiceSelected` state is set to `true` to prevent further interaction.
    -   The selected choice is highlighted.
    -   After a short delay (`setTimeout`), it determines the next scene or chapter and navigates to it using `router.push`, updating the URL parameters accordingly.
-   **Animations**: `react-native-reanimated` is used extensively to create smooth transitions between scenes. `FadeIn` and `FadeOut` are used for text and characters, while `SlideInRight` and `SlideOutLeft` could be used for scene transitions.
-   **UI Elements**: It uses `ImageBackground` to display the scene's background, `LinearGradient` to create overlays for better text readability, and custom components for the header (back button, currency counters).

### Components

-   **`DiamondCounter.tsx` & `TicketCounter.tsx`**: These are simple, reusable components that display a count of diamonds or tickets along with an icon. They accept a `size` prop to control their appearance. They can also be pressable by passing an `onPress` function.
-   **`GenreButton.tsx`**: A simple button component used for the genre filter on the home screen. It has a distinct style for its selected state.
-   **`StoryCard.tsx`**: A versatile component used to display a story's cover image, title, and genre. It has several props to customize its appearance:
    -   `compact`: For a smaller, more horizontal layout.
    -   `showProgress`: To display a progress bar if the user has started the story.
    -   It also shows a "NEW" badge or a "COMPLETED" badge based on the story's properties.

### Data Structures

-   **`data/storiesData.ts`**: This file acts as a mock database for the application.
    -   It defines the TypeScript interfaces (`Story`, `Chapter`, `Scene`) that shape the entire application's data.
    -   It contains an array of `stories`, which is the central source of truth for the app's content.
    -   It exports several functions (`getStoryById`, `getChapterById`, `getNextScene`, etc.) that act as a data access layer, allowing the UI components to query the story data in a structured way.
-   **`data/chapter1.json`**: This file represents a more detailed and structured format for a single chapter, likely intended to be fetched on demand.
    -   **Asset Manifest**: It includes an `assetManifest` which pre-declares all the image and audio assets needed for the chapter. This is a good practice for preloading assets and managing them efficiently.
    -   **Character Customization**: It contains a `characterCustomization` section, which defines the options for customizing the main character. This suggests that customization is specific to the story.
    -   **Detailed Scene Structure**: The scenes are in a `story` array, and each object is a "moment" with a `type` (e.g., `dialogue`, `choice`, `vfx`). This structure is more granular than the one in `storiesData.ts` and seems designed for a more powerful story engine. It includes details like character expressions (`jordan:uniform:groan`), sound effects (`sfx_bell_ring`), and visual effects (`vfx: "rumble"`).

This detailed breakdown should provide a much deeper understanding of how the different parts of your Interactive Stories application work together.
