import { NextResponse } from 'next/server';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Environment variable ${secretName} is not set in development environment.`);
    }
    return value;
  }

  let projectId: string | undefined;

  if (process.env.FIREBASE_CONFIG) {
    try {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      projectId = firebaseConfig.projectId;
    } catch {
      throw new Error('Invalid FIREBASE_CONFIG');
    }
  }

  // プロジェクトIDが取得できない場合はエラー
  if (!projectId) {
    throw new Error('Project ID not available');
  }

  try {
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });

    if (!version.payload?.data) {
      throw new Error('Secret not found');
    }
    return version.payload.data.toString();
  } catch {
    throw new Error('Failed to access secret');
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
