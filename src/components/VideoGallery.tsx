"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from './VideoPlayer';
import { VideoGalleryProps, VideoGeneration } from '@/types';

export function VideoGallery({ videos, onRetry, onDownload }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Calculate statistics
  const totalVideos = videos.length;
  const completedVideos = videos.filter(v => v.status === 'completed').length;
  const processingVideos = videos.filter(v => v.status === 'processing').length;
  const failedVideos = videos.filter(v => v.status === 'failed').length;
  const pendingVideos = videos.filter(v => v.status === 'pending').length;

  const overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const downloadAllCompleted = () => {
    const completedVideosList = videos.filter(v => v.status === 'completed' && v.videoUrl);
    completedVideosList.forEach(video => {
      if (onDownload) {
        onDownload(video.sceneId);
      }
    });
  };

  const retryAllFailed = () => {
    const failedVideosList = videos.filter(v => v.status === 'failed');
    failedVideosList.forEach(video => {
      if (onRetry) {
        onRetry(video.sceneId);
      }
    });
  };

  if (videos.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Generated Yet</h3>
            <p className="text-gray-500">Generate a script first, then create videos for each scene.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">Video Generation Progress</CardTitle>
              <CardDescription>
                {completedVideos} of {totalVideos} videos completed
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              {completedVideos > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAllCompleted}
                >
                  Download All ({completedVideos})
                </Button>
              )}
              {failedVideos > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryAllFailed}
                >
                  Retry Failed ({failedVideos})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Progress value={overallProgress} className="w-full" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{completedVideos}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{processingVideos}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">{pendingVideos}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">{failedVideos}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generated Videos</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon('completed')}
                <span>Complete</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon('processing')}
                <span>Processing</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon('pending')}
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon('failed')}
                <span>Failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Thumbnails Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {videos.map((video, index) => (
            <Card 
              key={video.sceneId} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedVideo === video.sceneId ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedVideo(selectedVideo === video.sceneId ? null : video.sceneId)}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                  {video.status === 'completed' && video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={`Scene ${index + 1} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getStatusIcon(video.status)}
                    </div>
                  )}
                  
                  {/* Status overlay */}
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      Scene {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    {getStatusIcon(video.status)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2">Scene {index + 1}</h3>
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant={video.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {video.status}
                    </Badge>
                    {video.status === 'processing' && video.progress && (
                      <span className="text-xs text-gray-500">{video.progress}%</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Video Detail View */}
        {selectedVideo && (
          <div className="mt-6">
            {videos
              .filter(video => video.sceneId === selectedVideo)
              .map(video => {
                // For this demo, we'll create a mock scene object
                // In a real app, you'd pass the actual scene data
                const mockScene = {
                  id: video.sceneId,
                  title: `Scene ${video.sceneId.replace('scene_', '')}`,
                  description: 'Scene description',
                  dialogue: ['Sample dialogue line 1', 'Sample dialogue line 2'],
                  visualDescription: 'Sample visual description for the scene',
                  mood: 'casual',
                  duration: 30,
                  characters: ['Character 1', 'Character 2']
                };

                return (
                  <VideoPlayer
                    key={video.sceneId}
                    video={video}
                    scene={mockScene}
                    onRetry={() => onRetry(video.sceneId)}
                    showControls={true}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}