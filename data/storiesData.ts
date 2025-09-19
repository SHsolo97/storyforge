// Mock data for stories
// In a real app, this would come from an API or database

interface Scene {
  id: string;
  type: 'narrative' | 'dialogue' | 'choice';
  text: string;
  background: string;
  music: string;
  character?: {
    name: string;
    image: string;
  };
  choices?: {
    text: string;
    premium: boolean;
    diamonds?: number;
  }[];
  timed?: boolean;
  playerImage?: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  ticketCost: number;
  completed: boolean;
  scenes: Scene[];
}

interface Story {
  id: string;
  title: string;
  genre: string;
  coverImage: string;
  description: string;
  chapters: Chapter[];
  new?: boolean;
  featured?: boolean;
  recentlyUpdated?: boolean;
  progress?: number;
}

const stories: Story[] = [
  {
    id: '1',
    title: "The CEO's Secret",
    genre: 'Romance',
    coverImage: 'https://images.pexels.com/photos/3178818/pexels-photo-3178818.jpeg',
    description: 'A chance encounter with a mysterious billionaire changes your life forever.',
    chapters: [
      {
        id: '1-1',
        title: 'First Encounter',
        description: 'Your life changes when you meet a mysterious stranger at an exclusive rooftop restaurant.',
        ticketCost: 0, // First chapter is free
        completed: true,
        scenes: [
          {
            id: '1-1-1',
            type: 'narrative',
            text: 'The city lights sparkle beneath you as you step onto the rooftop garden of the most exclusive restaurant in town.',
            background: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg',
            music: '/music/ambient-city.mp3'
          },
          {
            id: '1-1-2',
            type: 'dialogue',
            text: "I've been waiting for you. Thank you for accepting my invitation.",
            background: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg',
            music: '/music/ambient-city.mp3',
            character: {
              name: 'Mysterious CEO',
              image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
            }
          },
          {
            id: '1-1-3',
            type: 'choice',
            text: 'How do you respond?',
            background: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg',
            music: '/music/ambient-city.mp3',
            timed: true,
            playerImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
            choices: [
              {
                text: 'I was curious what someone like you would want with me.',
                premium: false
              },
              {
                text: "I wouldn't miss a chance to meet the most talked-about person in the city.",
                premium: false
              },
              {
                text: "I've been intrigued ever since your first message. What's this really about?",
                premium: true,
                diamonds: 15
              }
            ]
          }
        ]
      },
      {
        id: '1-2',
        title: 'Hidden Motives',
        description: 'Discover the real reason behind the mysterious invitation.',
        ticketCost: 2,
        completed: false,
        scenes: [
          {
            id: '1-2-1',
            type: 'narrative',
            text: 'The CEO leads you to a private section of the rooftop, away from prying eyes and ears.',
            background: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
            music: '/music/mysterious-encounter.mp3'
          }
          // More scenes...
        ]
      }
    ],
    new: true,
    featured: true,
    progress: 60
  }
  // More stories...
];

// Helper functions
// StoryCard expects a different Story interface
interface StoryCardData {
  id: string;
  title: string;
  genre: string;
  coverImage: string;
  description?: string;
  new?: boolean;
  featured?: boolean;
  recentlyUpdated?: boolean;
  progress?: number;
  chapters?: {
    total: number;
    completed: number;
  };
}

// Transform internal Story to StoryCard format
function transformStoryForCard(story: Story): StoryCardData {
  const totalChapters = story.chapters.length;
  const completedChapters = story.chapters.filter(chapter => chapter.completed).length;
  
  return {
    id: story.id,
    title: story.title,
    genre: story.genre,
    coverImage: story.coverImage,
    description: story.description,
    new: story.new,
    featured: story.featured,
    recentlyUpdated: story.recentlyUpdated,
    progress: story.progress,
    chapters: {
      total: totalChapters,
      completed: completedChapters
    }
  };
}

export function getFeaturedStories() {
  return stories.filter(story => story.featured).map(transformStoryForCard);
}

export function getRecentlyUpdated() {
  return stories.filter(story => story.recentlyUpdated).map(transformStoryForCard);
}

export function getNewStories() {
  return stories.filter(story => story.new).map(transformStoryForCard);
}

export function getStoriesByGenre(genre: string) {
  if (genre === 'All') {
    return stories.slice(0, 6).map(transformStoryForCard);
  }
  return stories.filter(story => story.genre === genre).map(transformStoryForCard);
}

export function getUserStories() {
  return stories.filter(story => story.progress !== undefined).map(transformStoryForCard);
}

export function getStoryById(id: string) {
  return stories.find(story => story.id === id);
}

export function getStoryProgress(id: string) {
  const story = stories.find(story => story.id === id);
  return story?.progress || 0;
}

export function getChapterById(storyId: string, chapterId: string) {
  const story = stories.find(story => story.id === storyId);
  return story?.chapters.find(chapter => chapter.id === chapterId);
}

export function getNextScene(storyId: string, chapterId: string, currentSceneId: string) {
  const chapter = getChapterById(storyId, chapterId);
  if (!chapter) return null;
  
  const currentIndex = chapter.scenes.findIndex(scene => scene.id === currentSceneId);
  if (currentIndex === -1 || currentIndex === chapter.scenes.length - 1) return null;
  
  return chapter.scenes[currentIndex + 1];
}

export function getNextChapter(storyId: string, currentChapterId: string) {
  const story = stories.find(story => story.id === storyId);
  if (!story) return null;
  
  const currentIndex = story.chapters.findIndex(chapter => chapter.id === currentChapterId);
  if (currentIndex === -1 || currentIndex === story.chapters.length - 1) return null;
  
  return story.chapters[currentIndex + 1];
}