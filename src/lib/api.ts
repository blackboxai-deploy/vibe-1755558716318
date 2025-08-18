import { 
  GenerateScriptRequest, 
  GenerateScriptResponse, 
  GenerateVideoRequest, 
  GenerateVideoResponse,
  BatchVideoGenerationRequest,
  BatchVideoGenerationResponse,
  ApiError 
} from '@/types';
import { APP_CONSTANTS, ERROR_MESSAGES } from './constants';

/**
 * Custom fetch wrapper with timeout and error handling
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.general.timeoutError);
    }
    
    throw error;
  }
}

/**
 * Makes a request to the AI API with proper error handling
 */
async function makeApiRequest(
  model: string, 
  messages: any[], 
  timeout: number = APP_CONSTANTS.timeouts.scriptGeneration
): Promise<any> {
  try {
    const response = await fetchWithTimeout(
      APP_CONSTANTS.api.endpoint,
      {
        method: 'POST',
        headers: APP_CONSTANTS.api.headers,
        body: JSON.stringify({
          model,
          messages,
        }),
      },
      timeout
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(ERROR_MESSAGES.general.rateLimitError);
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error(ERROR_MESSAGES.api.invalidResponse);
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('API request failed:', error);
    
    if (error.message.includes('timeout') || error.message.includes('abort')) {
      throw new Error(ERROR_MESSAGES.general.timeoutError);
    }
    
    if (error.message.includes('rate limit')) {
      throw new Error(ERROR_MESSAGES.general.rateLimitError);
    }
    
    if (error.message.includes('network') || error.name === 'NetworkError') {
      throw new Error(ERROR_MESSAGES.general.networkError);
    }
    
    throw new Error(error.message || ERROR_MESSAGES.general.unknownError);
  }
}

/**
 * Generates a podcast script using AI
 */
export async function generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResponse> {
  try {
    const systemPrompt = `You are a professional podcast script writer. Your task is to create engaging, realistic podcast scenes based on user prompts.

IMPORTANT: You must respond with valid JSON only. No additional text or explanations.

Create exactly 5 distinct scenes that flow together as a cohesive podcast episode. Each scene should:
- Have realistic dialogue between characters
- Include detailed visual descriptions for video generation
- Specify mood and tone
- Estimate duration in seconds
- Be engaging and authentic

User preferences:
- Tone: ${request.userPreferences?.tone || 'casual'}
- Total Duration: ${request.userPreferences?.duration || 3} minutes
- Number of Characters: ${request.userPreferences?.charactersCount || 2}

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

Make the scenes cinematic and suitable for video generation. Include specific visual details like camera angles, lighting, setting, and character actions.`;

    const userPrompt = `Create a podcast script based on this prompt: ${request.prompt}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const content = await makeApiRequest(
      APP_CONSTANTS.models.chat, 
      messages, 
      APP_CONSTANTS.timeouts.scriptGeneration
    );

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error(ERROR_MESSAGES.api.invalidResponse);
    }

    // Validate the response structure
    if (!parsedContent.title || !Array.isArray(parsedContent.scenes) || parsedContent.scenes.length !== 5) {
      throw new Error(ERROR_MESSAGES.api.invalidResponse);
    }

    // Create the script object
    const script = {
      id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: parsedContent.title,
      originalPrompt: request.prompt,
      scenes: parsedContent.scenes.map((scene: any, index: number) => ({
        id: `scene_${index + 1}`,
        title: scene.title,
        description: scene.description,
        dialogue: Array.isArray(scene.dialogue) ? scene.dialogue : [],
        visualDescription: scene.visualDescription,
        mood: scene.mood,
        duration: scene.duration || 30,
        characters: Array.isArray(scene.characters) ? scene.characters : []
      })),
      totalDuration: parsedContent.totalDuration || parsedContent.scenes.reduce((sum: number, scene: any) => sum + (scene.duration || 30), 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      script
    };

  } catch (error: any) {
    console.error('Script generation failed:', error);
    
    return {
      success: false,
      error: error.message || ERROR_MESSAGES.api.scriptGenerationFailed
    };
  }
}

/**
 * Generates a video for a single scene
 */
export async function generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  try {
    const videoPrompt = `Create a short video based on this podcast scene:

Title: ${request.sceneId}
Dialogue: ${request.dialogue.join(' ')}
Visual Description: ${request.visualDescription}
Mood: ${request.mood}
Duration: ${request.duration} seconds

Generate a cinematic video that captures the essence of this podcast scene with the specified mood and visual elements.`;

    const messages = [
      { 
        role: 'user', 
        content: videoPrompt
      }
    ];

    const content = await makeApiRequest(
      APP_CONSTANTS.models.video,
      messages,
      APP_CONSTANTS.timeouts.videoGeneration
    );

    // For video generation, the response should contain a URL or video data
    // This is a simplified implementation - actual video generation APIs may have different response formats
    let videoUrl: string;
    
    if (typeof content === 'string' && content.startsWith('http')) {
      videoUrl = content;
    } else {
      // Try to parse as JSON in case the response is structured
      try {
        const parsed = JSON.parse(content);
        videoUrl = parsed.url || parsed.video_url || parsed.output || '';
      } catch {
        throw new Error('Invalid video generation response format');
      }
    }

    if (!videoUrl) {
      throw new Error('No video URL received from generation service');
    }

    return {
      success: true,
      sceneId: request.sceneId,
      videoUrl,
      thumbnailUrl: `${videoUrl}?thumbnail=true` // Simplified thumbnail generation
    };

  } catch (error: any) {
    console.error('Video generation failed for scene:', request.sceneId, error);
    
    return {
      success: false,
      sceneId: request.sceneId,
      error: error.message || ERROR_MESSAGES.api.videoGenerationFailed
    };
  }
}

/**
 * Generates videos for all scenes in batch
 */
export async function generateVideos(request: BatchVideoGenerationRequest): Promise<BatchVideoGenerationResponse> {
  try {
    const results: GenerateVideoResponse[] = [];
    
    // Process scenes sequentially to avoid overwhelming the API
    for (const scene of request.scenes) {
      const videoRequest: GenerateVideoRequest = {
        sceneId: scene.id,
        visualDescription: scene.visualDescription,
        dialogue: scene.dialogue,
        mood: scene.mood,
        duration: scene.duration
      };
      
      const result = await generateVideo(videoRequest);
      results.push(result);
      
      // Small delay between requests to be respectful to the API
      if (scene !== request.scenes[request.scenes.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const hasFailures = results.some(result => !result.success);
    
    return {
      success: !hasFailures,
      results,
      error: hasFailures ? ERROR_MESSAGES.api.batchVideoGenerationFailed : undefined
    };

  } catch (error: any) {
    console.error('Batch video generation failed:', error);
    
    return {
      success: false,
      results: [],
      error: error.message || ERROR_MESSAGES.api.batchVideoGenerationFailed
    };
  }
}

/**
 * Downloads a video file
 */
export async function downloadVideo(videoUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error('Failed to download video');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error: any) {
    console.error('Video download failed:', error);
    throw new Error('Failed to download video');
  }
}

/**
 * Health check for the API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      APP_CONSTANTS.api.endpoint,
      {
        method: 'POST',
        headers: APP_CONSTANTS.api.headers,
        body: JSON.stringify({
          model: APP_CONSTANTS.models.chat,
          messages: [{ role: 'user', content: 'test' }],
        }),
      },
      5000 // 5 second timeout for health check
    );

    return response.ok;
  } catch {
    return false;
  }
}