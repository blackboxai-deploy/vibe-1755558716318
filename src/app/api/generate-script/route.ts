import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/api';
import { validateScriptGenerationRequest } from '@/lib/validations';
import { GenerateScriptRequest } from '@/types';
import { ERROR_MESSAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body: GenerateScriptRequest;
    
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
    const validationErrors = validateScriptGenerationRequest(body);
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationErrors.map(e => e.message).join(', '),
          validationErrors 
        },
        { status: 400 }
      );
    }

    // Generate the script
    const result = await generateScript(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || ERROR_MESSAGES.api.scriptGenerationFailed 
        },
        { status: 500 }
      );
    }

    // Return the successful result
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Script generation API error:', error);
    
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
      error: 'Method not allowed. Use POST to generate scripts.' 
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate scripts.' 
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate scripts.' 
    },
    { status: 405 }
  );
}