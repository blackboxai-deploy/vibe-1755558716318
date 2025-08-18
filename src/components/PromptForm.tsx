"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptFormProps, GenerateScriptRequest } from '@/types';
import { validatePrompt, formatValidationErrors } from '@/lib/validations';
import { EXAMPLE_PROMPTS, DEFAULT_PREFERENCES, APP_CONSTANTS } from '@/lib/constants';

export function PromptForm({ onSubmit, isLoading, disabled = false }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [errors, setErrors] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the prompt
    const validationErrors = validatePrompt(prompt);
    if (validationErrors.length > 0) {
      setErrors(formatValidationErrors(validationErrors));
      return;
    }
    
    setErrors('');
    
    // Submit the form
    const request: GenerateScriptRequest = {
      prompt: prompt.trim(),
      userPreferences: preferences
    };
    
    onSubmit(request.prompt, request.userPreferences);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
    setErrors('');
  };

  const characterCount = prompt.length;
  const isNearLimit = characterCount > APP_CONSTANTS.validation.prompt.maxLength * 0.8;
  const isOverLimit = characterCount > APP_CONSTANTS.validation.prompt.maxLength;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Your Podcast Scene</CardTitle>
        <CardDescription>
          Describe the podcast scene you want to create. Our AI will generate 5 distinct scenes with dialogue and visual descriptions, then convert them into videos.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Scene Description *
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe your podcast scene... (e.g., 'Two friends discussing their startup idea in a cozy coffee shop, one is excited while the other is skeptical about the risks involved.')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`min-h-[120px] resize-none ${isOverLimit ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={disabled || isLoading}
            />
            <div className="flex justify-between items-center text-sm">
              <span className={`${isNearLimit ? (isOverLimit ? 'text-red-500' : 'text-yellow-500') : 'text-gray-500'}`}>
                {characterCount} / {APP_CONSTANTS.validation.prompt.maxLength} characters
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
                disabled={disabled || isLoading}
              >
                {showExamples ? 'Hide Examples' : 'Show Examples'}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          {showExamples && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Example Prompts</Label>
              <div className="grid gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => handleExampleClick(example)}
                    disabled={disabled || isLoading}
                  >
                    <span className="text-sm text-gray-600 line-clamp-2">{example}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
              <Select
                value={preferences.tone}
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, tone: value }))}
                disabled={disabled || isLoading}
              >
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="comedic">Comedic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">Total Duration</Label>
              <Select
                value={preferences.duration.toString()}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, duration: parseInt(value) }))}
                disabled={disabled || isLoading}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="4">4 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="characters" className="text-sm font-medium">Characters</Label>
              <Select
                value={preferences.charactersCount.toString()}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, charactersCount: parseInt(value) }))}
                disabled={disabled || isLoading}
              >
                <SelectTrigger id="characters">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 character</SelectItem>
                  <SelectItem value="2">2 characters</SelectItem>
                  <SelectItem value="3">3 characters</SelectItem>
                  <SelectItem value="4">4 characters</SelectItem>
                  <SelectItem value="5">5 characters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {errors && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 whitespace-pre-line">{errors}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={disabled || isLoading || !prompt.trim() || isOverLimit}
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating Script...
              </>
            ) : (
              'Generate Podcast Script'
            )}
          </Button>
        </form>

        {/* Info Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary">AI-Powered</Badge>
            <Badge variant="secondary">5 Scenes</Badge>
            <Badge variant="secondary">Video Generation</Badge>
            <Badge variant="secondary">Professional Quality</Badge>
          </div>
          <p className="text-sm text-gray-600">
            Our AI will create 5 distinct scenes with realistic dialogue, detailed visual descriptions, and cinematic elements perfect for video generation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}