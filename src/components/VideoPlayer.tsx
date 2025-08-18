"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VideoPlayerProps } from '@/types';
import { downloadVideo } from '@/lib/api';

export function VideoPlayer({ video, scene, onRetry, showControls = true }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (progress: number) => {
    if (videoRef.current && duration > 0) {
      const newTime = (progress / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!video.videoUrl) return;
    
    setIsDownloading(true);
    setDownloadError('');
    
    try {
      const filename = `${scene.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${scene.id}.mp4`;
      await downloadVideo(video.videoUrl, filename);
    } catch (error: any) {
      setDownloadError(error.message || 'Failed to download video');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{scene.title}</CardTitle>
            <CardDescription>{scene.description}</CardDescription>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(video.status)} text-white border-none`}
              >
                {getStatusText(video.status)}
              </Badge>
              <Badge variant="outline">
                Duration: {scene.duration}s
              </Badge>
              <Badge variant="outline">
                Mood: {scene.mood}
              </Badge>
            </div>
          </div>
          
          {video.status === 'failed' && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Retry Generation
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player */}
        {video.status === 'completed' && video.videoUrl ? (
          <div className="space-y-3">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster={video.thumbnailUrl}
              />
              
              {/* Play button overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    className="rounded-full w-16 h-16"
                  >
                    <svg
                      className="w-6 h-6 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Video Controls */}
            {showControls && (
              <div className="space-y-2">
                <Progress 
                  value={duration > 0 ? (currentTime / duration) * 100 : 0}
                  className="cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const progress = (x / rect.width) * 100;
                    handleSeek(progress);
                  }}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Downloading...
                        </>
                      ) : (
                        'Download'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : video.status === 'processing' ? (
          <div className="space-y-3">
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-600">Generating video...</p>
                {video.progress && (
                  <p className="text-xs text-gray-500">{video.progress}% complete</p>
                )}
              </div>
            </div>
            {video.progress && (
              <Progress value={video.progress} className="w-full" />
            )}
          </div>
        ) : video.status === 'pending' ? (
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto" />
              <p className="text-sm text-gray-600">Waiting to start generation...</p>
            </div>
          </div>
        ) : video.status === 'failed' ? (
          <div className="h-48 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 bg-red-500 rounded-full mx-auto" />
              <p className="text-sm text-red-600">Video generation failed</p>
              {video.error && (
                <p className="text-xs text-red-500">{video.error}</p>
              )}
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-600">Video not generated yet</p>
          </div>
        )}

        {/* Scene Details */}
        <div className="space-y-3 pt-4 border-t">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Visual Description</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{scene.visualDescription}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Dialogue</h4>
            <div className="space-y-1">
              {scene.dialogue.map((line, index) => (
                <p key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Download Error */}
        {downloadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{downloadError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}