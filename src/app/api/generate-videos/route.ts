import { NextRequest, NextResponse } from 'next/server';
import { generateVideos } from '@/lib/api';
import { validateProjectId, validatePodcastScene } from '@/lib/validations';
import { BatchVideoGenerationRequest } from '@/types';
import { ERROR_MESSAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body: BatchVideoGenerationRequest;
    
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

    if (!body.scriptId || typeof body.scriptId !== 'string') {
      errors.push('Script ID is required');
    }

    if (!Array.isArray(body.scenes)) {
      errors.push('Scenes must be an array');
    } else {
      if (body.scenes.length === 0) {
        errors.push('At least one scene is required');
      }

      if (body.scenes.length > 10) {
        errors.push('Maximum 10 scenes allowed per batch');
      }

      // Validate each scene
      body.scenes.forEach((scene, index) => {
        const sceneErrors = validatePodcastScene(scene);
        if (sceneErrors.length > 0) {
          errors.push(`Scene ${index + 1}: ${sceneErrors.map(e => e.message).join(', ')}`);
        }
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: errors.join('; '),
          results: []
        },
        { status: 400 }
      );
    }

    // Generate the videos
    const result = await generateVideos(body);

    // Always return 200 for batch operations, even with partial failures
    // The client should check individual results
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Batch video generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        results: [],
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