// Core types for the podcast scene generator application

export interface PodcastScene {
  id: string;
  title: string;
  description: string;
  dialogue: string[];
  visualDescription: string;
  mood: string;
  duration: number; // in seconds
  characters: string[];
}

export interface PodcastScript {
  id: string;
  title: string;
  originalPrompt: string;
  scenes: PodcastScene[];
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoGeneration {
  sceneId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  progress?: number;
  error?: string;
  startTime?: string;
  completedTime?: string;
  duration?: number;
}

export interface GenerationProject {
  id: string;
  script: PodcastScript;
  videos: VideoGeneration[];
  status: 'script-generating' | 'script-ready' | 'videos-generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface GenerateScriptRequest {
  prompt: string;
  userPreferences?: {
    tone?: 'casual' | 'professional' | 'dramatic' | 'comedic';
    duration?: number; // total duration in minutes
    charactersCount?: number;
  };
}

export interface GenerateScriptResponse {
  success: boolean;
  script?: PodcastScript;
  error?: string;
}

export interface GenerateVideoRequest {
  sceneId: string;
  visualDescription: string;
  dialogue: string[];
  mood: string;
  duration: number;
}

export interface GenerateVideoResponse {
  success: boolean;
  sceneId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface BatchVideoGenerationRequest {
  scriptId: string;
  scenes: PodcastScene[];
}

export interface BatchVideoGenerationResponse {
  success: boolean;
  results: GenerateVideoResponse[];
  error?: string;
}

// UI Component Props
export interface PromptFormProps {
  onSubmit: (prompt: string, preferences?: GenerateScriptRequest['userPreferences']) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export interface ScriptDisplayProps {
  script: PodcastScript;
  onSceneEdit?: (sceneId: string, updatedScene: Partial<PodcastScene>) => void;
  onGenerateVideos: () => void;
  isGeneratingVideos: boolean;
}

export interface VideoGalleryProps {
  videos: VideoGeneration[];
  onRetry: (sceneId: string) => void;
  onDownload: (sceneId: string) => void;
}

export interface VideoPlayerProps {
  video: VideoGeneration;
  scene: PodcastScene;
  onRetry?: () => void;
  showControls?: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// API Configuration
export interface ApiConfig {
  endpoint: string;
  headers: {
    customerId: string;
    'Content-Type': string;
    Authorization: string;
  };
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStates {
  scriptGeneration: LoadingState;
  videoGeneration: LoadingState;
  individual: { [sceneId: string]: LoadingState };
}

// Theme and UI preferences
export interface UiPreferences {
  theme: 'light' | 'dark' | 'system';
  autoPlay: boolean;
  showDuration: boolean;
  compactView: boolean;
}

export interface AppState {
  currentProject: GenerationProject | null;
  loadingStates: LoadingStates;
  errors: { [key: string]: string };
  uiPreferences: UiPreferences;
}

// Validation schemas types
export interface ValidationSchema {
  prompt: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  preferences: {
    duration: {
      min: number;
      max: number;
    };
    charactersCount: {
      min: number;
      max: number;
    };
  };
}

// Constants
export interface AppConstants {
  api: ApiConfig;
  validation: ValidationSchema;
  timeouts: {
    scriptGeneration: number;
    videoGeneration: number;
  };
  models: {
    chat: string;
    video: string;
  };
  ui: {
    maxRetries: number;
    pollInterval: number;
  };
}