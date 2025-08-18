import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/api';
import { validateSceneId, validateDialogue, validateSceneDuration } from '@/lib/validations';
import { GenerateVideoRequest } from '@/types';
import { ERROR_MESSAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body: GenerateVideoRequest;
    
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    // Validate the request
    const errors: string[] = [];

    if (!body.sceneId || !validateSceneId(body.sceneId)) {
      errors.push('Invalid scene ID format');
    }

    if (!body.visualDescription || typeof body.visualDescription !== 'string' || body.visualDescription.trim().length === 0) {
      errors.push('Visual description is required');
    }

    if (!body.mood || typeof body.mood !== 'string' || body.mood.trim().length === 0) {
      errors.push('Mood is required');
    }

    const dialogueErrors = validateDialogue(body.dialogue);
    if (dialogueErrors.length > 0) {
      errors.push(...dialogueErrors.map(e => e.message));
    }

    const durationErrors = validateSceneDuration(body.duration);
    if (durationErrors.length > 0) {
      errors.push(...durationErrors.map(e => e.message));
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: errors.join(', '),
          sceneId: body.sceneId
        },
        { status: 400 }
      );
    }

    // Generate the video
    const result = await generateVideo(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          sceneId: body.sceneId,
          error: result.error || ERROR_MESSAGES.api.videoGenerationFailed 
        },
        { status: 500 }
      );
    }

    // Return the successful result
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Video generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: ERROR_MESSAGES.general.unknownError 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate videos.' 
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate videos.' 
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate videos.' 
    },
    { status: 405 }
  );
}