import { APP_CONSTANTS, ERROR_MESSAGES } from './constants';
import { GenerateScriptRequest, ValidationError } from '@/types';

/**
 * Validates a podcast prompt input
 */
export function validatePrompt(prompt: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!prompt || prompt.trim().length === 0) {
    errors.push({
      field: 'prompt',
      message: ERROR_MESSAGES.validation.promptRequired
    });
    return errors;
  }
  
  const trimmedPrompt = prompt.trim();
  
  if (trimmedPrompt.length < APP_CONSTANTS.validation.prompt.minLength) {
    errors.push({
      field: 'prompt',
      message: ERROR_MESSAGES.validation.promptTooShort
    });
  }
  
  if (trimmedPrompt.length > APP_CONSTANTS.validation.prompt.maxLength) {
    errors.push({
      field: 'prompt',
      message: ERROR_MESSAGES.validation.promptTooLong
    });
  }
  
  return errors;
}

/**
 * Validates user preferences for script generation
 */
export function validatePreferences(preferences?: GenerateScriptRequest['userPreferences']): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!preferences) {
    return errors; // Preferences are optional
  }
  
  if (preferences.duration !== undefined) {
    if (preferences.duration < APP_CONSTANTS.validation.preferences.duration.min || 
        preferences.duration > APP_CONSTANTS.validation.preferences.duration.max) {
      errors.push({
        field: 'duration',
        message: ERROR_MESSAGES.validation.invalidDuration
      });
    }
  }
  
  if (preferences.charactersCount !== undefined) {
    if (preferences.charactersCount < APP_CONSTANTS.validation.preferences.charactersCount.min || 
        preferences.charactersCount > APP_CONSTANTS.validation.preferences.charactersCount.max) {
      errors.push({
        field: 'charactersCount',
        message: ERROR_MESSAGES.validation.invalidCharacterCount
      });
    }
  }
  
  return errors;
}

/**
 * Validates the complete script generation request
 */
export function validateScriptGenerationRequest(request: GenerateScriptRequest): ValidationError[] {
  const promptErrors = validatePrompt(request.prompt);
  const preferencesErrors = validatePreferences(request.userPreferences);
  
  return [...promptErrors, ...preferencesErrors];
}

/**
 * Validates that a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a string is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }
  
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const lowercaseUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowercaseUrl.includes(ext)) ||
         lowercaseUrl.includes('video') ||
         lowercaseUrl.includes('replicate');
}

/**
 * Sanitizes user input to prevent XSS and other security issues
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Validates that a scene ID is properly formatted
 */
export function validateSceneId(sceneId: string): boolean {
  const sceneIdPattern = /^scene_\d+$/;
  return sceneIdPattern.test(sceneId);
}

/**
 * Validates that a project ID is properly formatted
 */
export function validateProjectId(projectId: string): boolean {
  const projectIdPattern = /^proj_[a-zA-Z0-9]{10,}$/;
  return projectIdPattern.test(projectId);
}

/**
 * Validates dialogue array for a scene
 */
export function validateDialogue(dialogue: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!Array.isArray(dialogue)) {
    errors.push({
      field: 'dialogue',
      message: 'Dialogue must be an array of strings'
    });
    return errors;
  }
  
  if (dialogue.length === 0) {
    errors.push({
      field: 'dialogue',
      message: 'Dialogue cannot be empty'
    });
  }
  
  dialogue.forEach((line, index) => {
    if (typeof line !== 'string' || line.trim().length === 0) {
      errors.push({
        field: `dialogue[${index}]`,
        message: `Dialogue line ${index + 1} must be a non-empty string`
      });
    }
  });
  
  return errors;
}

/**
 * Validates scene duration
 */
export function validateSceneDuration(duration: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (typeof duration !== 'number' || isNaN(duration)) {
    errors.push({
      field: 'duration',
      message: 'Duration must be a valid number'
    });
    return errors;
  }
  
  if (duration <= 0) {
    errors.push({
      field: 'duration',
      message: 'Duration must be greater than 0'
    });
  }
  
  if (duration > 300) { // 5 minutes max per scene
    errors.push({
      field: 'duration',
      message: 'Duration cannot exceed 5 minutes per scene'
    });
  }
  
  return errors;
}

/**
 * Validates characters array for a scene
 */
export function validateCharacters(characters: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!Array.isArray(characters)) {
    errors.push({
      field: 'characters',
      message: 'Characters must be an array of strings'
    });
    return errors;
  }
  
  if (characters.length === 0) {
    errors.push({
      field: 'characters',
      message: 'At least one character is required'
    });
  }
  
  characters.forEach((character, index) => {
    if (typeof character !== 'string' || character.trim().length === 0) {
      errors.push({
        field: `characters[${index}]`,
        message: `Character ${index + 1} must be a non-empty string`
      });
    }
  });
  
  return errors;
}

/**
 * Validates a complete podcast scene object
 */
export function validatePodcastScene(scene: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!scene.id || typeof scene.id !== 'string') {
    errors.push({
      field: 'id',
      message: 'Scene must have a valid ID'
    });
  }
  
  if (!scene.title || typeof scene.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Scene must have a valid title'
    });
  }
  
  if (!scene.description || typeof scene.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Scene must have a valid description'
    });
  }
  
  if (!scene.visualDescription || typeof scene.visualDescription !== 'string') {
    errors.push({
      field: 'visualDescription',
      message: 'Scene must have a valid visual description'
    });
  }
  
  if (!scene.mood || typeof scene.mood !== 'string') {
    errors.push({
      field: 'mood',
      message: 'Scene must have a valid mood'
    });
  }
  
  errors.push(...validateDialogue(scene.dialogue));
  errors.push(...validateSceneDuration(scene.duration));
  errors.push(...validateCharacters(scene.characters));
  
  return errors;
}

/**
 * Utility function to check if there are any validation errors
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

/**
 * Utility function to format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return errors.map(error => `• ${error.message}`).join('\n');
}