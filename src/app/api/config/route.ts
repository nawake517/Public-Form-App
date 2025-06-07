import { NextResponse } from 'next/server';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string> {
  // 開発環境では.env.localから取得
  if (process.env.NODE_ENV === 'development') {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Environment variable ${secretName} is not set in development environment.`);
    }
    return value;
  }

  // 本番環境でのプロジェクトIDの取得 (FIREBASE_CONFIGからパース)
  let projectId: string | undefined;

  if (process.env.FIREBASE_CONFIG) {
    try {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      projectId = firebaseConfig.projectId;
    } catch (e) {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        console.error('Error parsing FIREBASE_CONFIG:', e instanceof Error ? e.message : 'Unknown error');
      }
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
      throw new Error(`Secret not found: ${secretName}`);
    }
    return version.payload.data.toString();
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      console.error(`Secret Manager error for ${secretName}:`, error);
    }
    throw new Error('Failed to access secret');
  }
}

export async function GET() {
  try {
    const config = {
      firebase: {
        apiKey: await getSecret('NEXT_PUBLIC_FIREBASE_API_KEY'),
        authDomain: await getSecret('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        projectId: await getSecret('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: await getSecret('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: await getSecret('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: await getSecret('NEXT_PUBLIC_FIREBASE_APP_ID'),
      },
      email: {
        user: await getSecret('GMAIL_USER'),
        password: await getSecret('GMAIL_APP_PASSWORD'),
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      console.error('Configuration error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
