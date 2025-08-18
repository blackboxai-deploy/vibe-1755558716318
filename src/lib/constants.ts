import { AppConstants } from '@/types';

// Application constants and configuration
export const APP_CONSTANTS: AppConstants = {
  api: {
    endpoint: 'https://oi-server.onrender.com/chat/completions',
    headers: {
      customerId: 'cus_SGPn4uhjPI0F4w',
      'Content-Type': 'application/json',
      Authorization: 'Bearer xxx'
    }
  },
  validation: {
    prompt: {
      minLength: 10,
      maxLength: 2000,
      required: true
    },
    preferences: {
      duration: {
        min: 1,
        max: 10
      },
      charactersCount: {
        min: 1,
        max: 5
      }
    }
  },
  timeouts: {
    scriptGeneration: 5 * 60 * 1000, // 5 minutes
    videoGeneration: 15 * 60 * 1000  // 15 minutes
  },
  models: {
    chat: 'openrouter/anthropic/claude-sonnet-4',
    video: 'replicate/google/veo-3'
  },
  ui: {
    maxRetries: 3,
    pollInterval: 2000 // 2 seconds
  }
};

// System prompts for AI models
export const SYSTEM_PROMPTS = {
  scriptGeneration: `You are a professional podcast script writer. Your task is to create engaging, realistic podcast scenes based on user prompts.

IMPORTANT: You must respond with valid JSON only. No additional text or explanations.

Create exactly 5 distinct scenes that flow together as a cohesive podcast episode. Each scene should:
- Have realistic dialogue between characters
- Include detailed visual descriptions for video generation
- Specify mood and tone
- Estimate duration in seconds
- Be engaging and authentic

Response format:
{
  "title": "Episode Title",
  "scenes": [
    {
      "id": "scene_1",
      "title": "Scene Title",
      "description": "Brief scene description",
      "dialogue": ["Character 1: dialogue", "Character 2: dialogue"],
      "visualDescription": "Detailed visual description for video generation including setting, lighting, camera angles, character actions",
      "mood": "mood/tone description",
      "duration": 30,
      "characters": ["Character 1", "Character 2"]
    }
  ],
  "totalDuration": 150
}

Make the scenes cinematic and suitable for video generation. Include specific visual details like camera angles, lighting, setting, and character actions.`,

  videoGeneration: (scene: any) => `Create a short video based on this podcast scene:

Title: ${scene.title}
Dialogue: ${scene.dialogue.join(' ')}
Visual Description: ${scene.visualDescription}
Mood: ${scene.mood}
Duration: ${scene.duration} seconds

Generate a cinematic video that captures the essence of this podcast scene with the specified mood and visual elements.`
};

// UI Configuration
export const UI_CONFIG = {
  colors: {
    primary: 'hsl(222.2 84% 4.9%)',
    secondary: 'hsl(210 40% 98%)',
    accent: 'hsl(210 40% 98%)',
    muted: 'hsl(210 40% 96%)'
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  general: {
    networkError: 'Network error occurred. Please check your connection and try again.',
    unknownError: 'An unexpected error occurred. Please try again.',
    timeoutError: 'Request timed out. Please try again.',
    rateLimitError: 'Too many requests. Please wait a moment and try again.'
  },
  validation: {
    promptTooShort: `Prompt must be at least ${APP_CONSTANTS.validation.prompt.minLength} characters long.`,
    promptTooLong: `Prompt must not exceed ${APP_CONSTANTS.validation.prompt.maxLength} characters.`,
    promptRequired: 'Please enter a prompt for your podcast scene.',
    invalidDuration: `Duration must be between ${APP_CONSTANTS.validation.preferences.duration.min} and ${APP_CONSTANTS.validation.preferences.duration.max} minutes.`,
    invalidCharacterCount: `Character count must be between ${APP_CONSTANTS.validation.preferences.charactersCount.min} and ${APP_CONSTANTS.validation.preferences.charactersCount.max}.`
  },
  api: {
    scriptGenerationFailed: 'Failed to generate script. Please try again with a different prompt.',
    videoGenerationFailed: 'Failed to generate video for this scene. Please try again.',
    batchVideoGenerationFailed: 'Some videos failed to generate. You can retry individual scenes.',
    invalidResponse: 'Received invalid response from AI service. Please try again.'
  }
};

// Success messages
export const SUCCESS_MESSAGES = {
  scriptGenerated: 'Script generated successfully! You can now generate videos for each scene.',
  videoGenerated: 'Video generated successfully!',
  allVideosGenerated: 'All videos generated successfully!',
  projectSaved: 'Project saved successfully!'
};

// Default preferences
export const DEFAULT_PREFERENCES = {
  tone: 'casual' as const,
  duration: 3, // minutes
  charactersCount: 2
};

// File download configuration
export const DOWNLOAD_CONFIG = {
  scriptFormat: 'json',
  videoFormat: 'mp4',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
};

// Local storage keys
export const STORAGE_KEYS = {
  currentProject: 'podcast-generator-current-project',
  userPreferences: 'podcast-generator-user-preferences',
  recentProjects: 'podcast-generator-recent-projects'
};

// API endpoints
export const API_ENDPOINTS = {
  generateScript: '/api/generate-script',
  generateVideo: '/api/generate-video',
  generateVideos: '/api/generate-videos',
  health: '/api/health'
};

// Example prompts for user guidance
export const EXAMPLE_PROMPTS = [
  "Two friends discussing their startup idea in a cozy coffee shop, one is excited while the other is skeptical about the risks involved.",
  "A detective interviewing a witness about a mysterious disappearance, with tension building as inconsistencies emerge in the story.",
  "A cooking show host teaching a nervous beginner how to make pasta, with humorous mishaps and encouraging moments.",
  "Two colleagues having a heated debate about work-life balance during their lunch break in a busy office cafeteria.",
  "A therapist session where a client is opening up about their fear of public speaking before an important presentation."
];

// Feature flags
export const FEATURE_FLAGS = {
  enableRetry: true,
  enableDownload: true,
  enableEdit: true,
  enableShare: false, // Future feature
  enableAnalytics: false, // Future feature
  enableProgressPolling: true
};