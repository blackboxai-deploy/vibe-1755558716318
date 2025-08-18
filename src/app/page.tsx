"use client";

import { useState, useCallback } from 'react';
import { PromptForm } from '@/components/PromptForm';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { VideoGallery } from '@/components/VideoGallery';
import { LoadingStates } from '@/components/LoadingStates';
import { InlineError, SuccessMessage } from '@/components/ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PodcastScript, 
  VideoGeneration, 
  GenerateScriptRequest,
  LoadingState,
  GenerateScriptResponse,
  BatchVideoGenerationResponse 
} from '@/types';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/lib/constants';

export default function HomePage() {
  // State management
  const [currentScript, setCurrentScript] = useState<PodcastScript | null>(null);
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [scriptGenerationState, setScriptGenerationState] = useState<LoadingState>('idle');
  const [videoGenerationState, setVideoGenerationState] = useState<LoadingState>('idle');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Clear errors and success messages
  const clearMessages = useCallback(() => {
    setErrors({});
    setSuccessMessage('');
  }, []);

  // Generate script from user prompt
  const handleScriptGeneration = useCallback(async (
    prompt: string, 
    preferences?: GenerateScriptRequest['userPreferences']
  ) => {
    clearMessages();
    setScriptGenerationState('loading');

    try {
      const response = await fetch(API_ENDPOINTS.generateScript, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userPreferences: preferences,
        }),
      });

      const result: GenerateScriptResponse = await response.json();

      if (!result.success || !result.script) {
        throw new Error(result.error || 'Failed to generate script');
      }

      setCurrentScript(result.script);
      setScriptGenerationState('success');
      setSuccessMessage(SUCCESS_MESSAGES.scriptGenerated);

      // Initialize video states for each scene
      const initialVideos: VideoGeneration[] = result.script.scenes.map(scene => ({
        sceneId: scene.id,
        status: 'pending',
      }));
      setVideos(initialVideos);

    } catch (error: any) {
      console.error('Script generation failed:', error);
      setScriptGenerationState('error');
      setErrors({ script: error.message });
    }
  }, [clearMessages]);

  // Generate videos for all scenes
  const handleVideoGeneration = useCallback(async () => {
    if (!currentScript) return;

    clearMessages();
    setVideoGenerationState('loading');

    // Update all videos to processing state
    setVideos(prev => prev.map(video => ({
      ...video,
      status: 'processing' as const,
      startTime: new Date().toISOString(),
    })));

    try {
      const response = await fetch(API_ENDPOINTS.generateVideos, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptId: currentScript.id,
          scenes: currentScript.scenes,
        }),
      });

      const result: BatchVideoGenerationResponse = await response.json();

      // Update video states based on results
      setVideos(prev => {
        const updatedVideos = [...prev];
        result.results.forEach(videoResult => {
          const index = updatedVideos.findIndex(v => v.sceneId === videoResult.sceneId);
          if (index !== -1) {
            updatedVideos[index] = {
              ...updatedVideos[index],
              status: videoResult.success ? 'completed' : 'failed',
              videoUrl: videoResult.videoUrl,
              thumbnailUrl: videoResult.thumbnailUrl,
              error: videoResult.error,
              completedTime: new Date().toISOString(),
            };
          }
        });
        return updatedVideos;
      });

      if (result.success) {
        setVideoGenerationState('success');
        setSuccessMessage(SUCCESS_MESSAGES.allVideosGenerated);
      } else {
        setVideoGenerationState('error');
        setErrors({ video: result.error || 'Some videos failed to generate' });
      }

    } catch (error: any) {
      console.error('Video generation failed:', error);
      setVideoGenerationState('error');
      setErrors({ video: error.message });
      
      // Mark all videos as failed
      setVideos(prev => prev.map(video => ({
        ...video,
        status: 'failed' as const,
        error: error.message,
      })));
    }
  }, [currentScript, clearMessages]);

  // Retry video generation for a specific scene
  const handleVideoRetry = useCallback(async (sceneId: string) => {
    if (!currentScript) return;

    const scene = currentScript.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    // Update specific video to processing state
    setVideos(prev => prev.map(video => 
      video.sceneId === sceneId 
        ? { ...video, status: 'processing' as const, startTime: new Date().toISOString(), error: undefined }
        : video
    ));

    try {
      const response = await fetch(API_ENDPOINTS.generateVideo, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneId: scene.id,
          visualDescription: scene.visualDescription,
          dialogue: scene.dialogue,
          mood: scene.mood,
          duration: scene.duration,
        }),
      });

      const result = await response.json();

      // Update specific video state
      setVideos(prev => prev.map(video => 
        video.sceneId === sceneId 
          ? {
              ...video,
              status: result.success ? 'completed' : 'failed',
              videoUrl: result.videoUrl,
              thumbnailUrl: result.thumbnailUrl,
              error: result.error,
              completedTime: new Date().toISOString(),
            }
          : video
      ));

    } catch (error: any) {
      console.error('Video retry failed:', error);
      setVideos(prev => prev.map(video => 
        video.sceneId === sceneId 
          ? { ...video, status: 'failed' as const, error: error.message }
          : video
      ));
    }
  }, [currentScript]);

  // Handle video download
  const handleVideoDownload = useCallback(async (sceneId: string) => {
    const video = videos.find(v => v.sceneId === sceneId);
    if (!video || !video.videoUrl) return;

    try {
      const response = await fetch(video.videoUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scene_${sceneId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setErrors({ download: `Failed to download video: ${error.message}` });
    }
  }, [videos]);

  // Edit scene dialogue
  const handleSceneEdit = useCallback((sceneId: string, updates: any) => {
    if (!currentScript) return;

    setCurrentScript(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        scenes: prev.scenes.map(scene => 
          scene.id === sceneId 
            ? { ...scene, ...updates }
            : scene
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentScript]);

  // Reset to start over
  const handleReset = useCallback(() => {
    setCurrentScript(null);
    setVideos([]);
    setScriptGenerationState('idle');
    setVideoGenerationState('idle');
    clearMessages();
  }, [clearMessages]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Create Podcast Scenes with AI
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your ideas into professional podcast scripts with 5 distinct scenes, 
          then convert each scene into cinematic videos using advanced AI technology.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">AI Script Generation</Badge>
          <Badge variant="secondary">5 Unique Scenes</Badge>
          <Badge variant="secondary">Video Creation</Badge>
          <Badge variant="secondary">Professional Quality</Badge>
        </div>
      </div>

      {/* Success Messages */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onDismiss={() => setSuccessMessage('')} 
        />
      )}

      {/* Error Messages */}
      {Object.entries(errors).map(([key, error]) => (
        <InlineError 
          key={key}
          error={error} 
          onDismiss={() => setErrors(prev => ({ ...prev, [key]: '' }))}
          onRetry={key === 'script' ? () => window.location.reload() : undefined}
        />
      ))}

      {/* Main Workflow */}
      {scriptGenerationState === 'idle' && (
        <PromptForm 
          onSubmit={handleScriptGeneration}
          isLoading={false}
        />
      )}

      {scriptGenerationState === 'loading' && (
        <LoadingStates 
          type="script"
          progress={50}
          currentStep="Generating scenes with dialogue..."
          estimatedTime="1-2 minutes"
        />
      )}

      {currentScript && scriptGenerationState === 'success' && (
        <div className="space-y-6">
          {/* Reset Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              Start New Project
            </Button>
          </div>

          <ScriptDisplay 
            script={currentScript}
            onSceneEdit={handleSceneEdit}
            onGenerateVideos={handleVideoGeneration}
            isGeneratingVideos={videoGenerationState === 'loading'}
          />
        </div>
      )}

      {videoGenerationState === 'loading' && (
        <LoadingStates 
          type="batch-video"
          progress={50}
          currentStep="Processing scenes sequentially..."
          estimatedTime="10-15 minutes"
          completedItems={videos.filter(v => v.status === 'completed').length}
          totalItems={videos.length}
        />
      )}

      {videos.length > 0 && videoGenerationState !== 'loading' && (
        <VideoGallery 
          videos={videos}
          onRetry={handleVideoRetry}
          onDownload={handleVideoDownload}
        />
      )}

      {/* Features Section */}
      {scriptGenerationState === 'idle' && (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <CardTitle>AI Script Generation</CardTitle>
              <CardDescription>
                Advanced AI creates realistic dialogue, character interactions, and detailed scene descriptions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Video Generation</CardTitle>
              <CardDescription>
                Each scene converts into professional-quality cinematic videos with appropriate mood and styling
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle>Export & Download</CardTitle>
              <CardDescription>
                Download your scripts as JSON files and videos as MP4 files for use in your podcast production
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* How It Works Section */}
      {scriptGenerationState === 'idle' && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">How It Works</CardTitle>
            <CardDescription className="text-center">
              Create professional podcast content in three simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold">Describe Your Scene</h3>
                <p className="text-gray-600">
                  Enter a description of your podcast scene. Include characters, setting, mood, and any specific elements you want.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold">AI Generates Script</h3>
                <p className="text-gray-600">
                  Our AI creates 5 distinct scenes with realistic dialogue, character interactions, and detailed visual descriptions.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold">Create Videos</h3>
                <p className="text-gray-600">
                  Each scene converts into a professional video with cinematic quality, ready for your podcast production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}