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
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw error;
  }
}

export async function GET() {
  try {
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
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
} 