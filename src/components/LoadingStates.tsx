"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LoadingStatesProps {
  type: 'script' | 'video' | 'batch-video';
  progress?: number;
  currentStep?: string;
  estimatedTime?: string;
  completedItems?: number;
  totalItems?: number;
}

export function LoadingStates({ 
  type, 
  progress = 0, 
  currentStep, 
  estimatedTime,
  completedItems = 0,
  totalItems = 0
}: LoadingStatesProps) {
  
  const getLoadingContent = () => {
    switch (type) {
      case 'script':
        return {
          title: 'Generating Podcast Script',
          description: 'Our AI is creating 5 unique scenes with dialogue and visual descriptions...',
          icon: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          steps: [
            'Analyzing your prompt...',
            'Creating scene structure...',
            'Generating character dialogue...',
            'Adding visual descriptions...',
            'Finalizing script...'
          ]
        };
      
      case 'video':
        return {
          title: 'Generating Video',
          description: 'Converting scene description into a cinematic video...',
          icon: (
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          steps: [
            'Processing visual description...',
            'Setting up scene composition...',
            'Rendering video frames...',
            'Adding cinematic effects...',
            'Finalizing video...'
          ]
        };
        
      case 'batch-video':
        return {
          title: 'Generating All Videos',
          description: `Processing ${totalItems} scenes sequentially for optimal quality...`,
          icon: (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3zM6 6v12h12V6H6zm3-2V3h6v1H9z" />
            </svg>
          ),
          steps: [
            'Preparing video queue...',
            'Processing scenes sequentially...',
            'Optimizing for quality...',
            'Finalizing all videos...'
          ]
        };
        
      default:
        return {
          title: 'Processing...',
          description: 'Please wait while we process your request.',
          icon: (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ),
          steps: ['Processing...']
        };
    }
  };

  const content = getLoadingContent();
  const currentStepIndex = Math.floor((progress / 100) * content.steps.length);
  const displayStep = currentStep || content.steps[Math.min(currentStepIndex, content.steps.length - 1)];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="animate-pulse">
            {content.icon}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">{content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {displayStep}
            </span>
            {progress > 0 && (
              <span className="text-sm text-gray-500">
                {Math.round(progress)}%
              </span>
            )}
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Batch Progress */}
        {type === 'batch-video' && totalItems > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Videos Completed
              </span>
              <span className="text-sm text-gray-500">
                {completedItems} / {totalItems}
              </span>
            </div>
            <Progress 
              value={totalItems > 0 ? (completedItems / totalItems) * 100 : 0} 
              className="w-full" 
            />
          </div>
        )}

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-xs">
              Estimated time: {estimatedTime}
            </Badge>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Process Steps</h4>
          <div className="space-y-1">
            {content.steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 text-sm ${
                  index <= currentStepIndex 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  index < currentStepIndex
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-300'
                }`} />
                <span className={
                  index === currentStepIndex ? 'font-medium' : ''
                }>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-700">
              {type === 'script' && (
                <p>Script generation typically takes 30-60 seconds. High-quality results require processing time.</p>
              )}
              {type === 'video' && (
                <p>Video generation can take 2-5 minutes per scene. Quality rendering requires patience.</p>
              )}
              {type === 'batch-video' && (
                <p>Batch processing ensures consistent quality. Videos are generated one at a time to optimize results.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}