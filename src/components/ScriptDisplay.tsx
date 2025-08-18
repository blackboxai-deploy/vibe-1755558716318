"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScriptDisplayProps, PodcastScene } from '@/types';

export function ScriptDisplay({ 
  script, 
  onSceneEdit, 
  onGenerateVideos, 
  isGeneratingVideos 
}: ScriptDisplayProps) {
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [editedDialogue, setEditedDialogue] = useState<string>('');

  const handleEditStart = (scene: PodcastScene) => {
    setEditingScene(scene.id);
    setEditedDialogue(scene.dialogue.join('\n'));
  };

  const handleEditSave = (sceneId: string) => {
    if (onSceneEdit) {
      const dialogueLines = editedDialogue
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      onSceneEdit(sceneId, { dialogue: dialogueLines });
    }
    setEditingScene(null);
    setEditedDialogue('');
  };

  const handleEditCancel = () => {
    setEditingScene(null);
    setEditedDialogue('');
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const downloadScript = () => {
    const scriptData = {
      ...script,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(scriptData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Script Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">{script.title}</CardTitle>
              <CardDescription className="text-base">
                {script.originalPrompt}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {script.scenes.length} Scenes
                </Badge>
                <Badge variant="outline">
                  Total Duration: {formatDuration(script.totalDuration)}
                </Badge>
                <Badge variant="outline">
                  Created: {new Date(script.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadScript}
                size="sm"
              >
                Download Script
              </Button>
              <Button
                onClick={onGenerateVideos}
                disabled={isGeneratingVideos}
                size="sm"
              >
                {isGeneratingVideos ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Videos...
                  </>
                ) : (
                  'Generate All Videos'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scenes */}
      <div className="grid gap-6">
        {script.scenes.map((scene, index) => (
          <Card key={scene.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Scene {index + 1}</Badge>
                    <CardTitle className="text-lg">{scene.title}</CardTitle>
                  </div>
                  <CardDescription>{scene.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      Duration: {formatDuration(scene.duration)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Mood: {scene.mood}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Characters: {scene.characters.join(', ')}
                    </Badge>
                  </div>
                </div>
                
                {onSceneEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditStart(scene)}
                    disabled={editingScene === scene.id || isGeneratingVideos}
                  >
                    {editingScene === scene.id ? 'Editing...' : 'Edit Dialogue'}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Visual Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Visual Description</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">{scene.visualDescription}</p>
                </div>
              </div>

              {/* Dialogue */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Dialogue</Label>
                
                {editingScene === scene.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedDialogue}
                      onChange={(e) => setEditedDialogue(e.target.value)}
                      placeholder="Enter dialogue lines, one per line..."
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(scene.id)}
                      >
                        Save Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scene.dialogue.map((line, lineIndex) => (
                      <div key={lineIndex} className="p-2 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm font-mono">{line}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              onClick={onGenerateVideos}
              disabled={isGeneratingVideos}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isGeneratingVideos ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Videos for All Scenes...
                </>
              ) : (
                'Generate Videos for All Scenes'
              )}
            </Button>
            
            <div className="text-sm text-gray-600 text-center">
              <p>Videos will be generated sequentially for each scene.</p>
              <p>This process may take several minutes per video.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}