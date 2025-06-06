import { NextResponse } from 'next/server';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Environment variable ${secretName} is not set`);
    }
    return value;
  }

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
    }
    console.error('Debug - Project ID:', projectId); // デバッグ用

    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    console.error('Debug - Accessing secret:', secretName); // デバッグ用（シークレット名のみログ出力）

    try {
      const [version] = await client.accessSecretVersion({ name });
      if (!version.payload?.data) {
        throw new Error(`No data found for secret: ${secretName}`);
      }
      return version.payload.data.toString();
    } catch (secretError) {
      console.error('Debug - Secret Manager Error:', secretError instanceof Error ? secretError.message : 'Unknown error');
      throw new Error(`Failed to access secret ${secretName}: ${secretError instanceof Error ? secretError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Debug - Error in getSecret:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function GET() {
  try {
    console.error('Debug - Starting config retrieval'); // デバッグ用
    console.error('Debug - Environment:', process.env.NODE_ENV); // デバッグ用

    const config = {
      apiKey: await getSecret('NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: await getSecret('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: await getSecret('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: await getSecret('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: await getSecret('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: await getSecret('NEXT_PUBLIC_FIREBASE_APP_ID'),
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Debug - Error in GET handler:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        error: 'Failed to fetch configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 