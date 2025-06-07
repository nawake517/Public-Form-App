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
      if (firebaseConfig.projectId) {
        projectId = firebaseConfig.projectId;
      }
    } catch (e) {
      // パースエラーはログに出力するが、処理は継続
      console.error('Error parsing FIREBASE_CONFIG in production:', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  // プロジェクトIDが取得できない場合はエラー
  if (!projectId) {
    throw new Error('Project ID is not available in the production environment. Check FIREBASE_CONFIG.');
  }

  try {
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });

    if (!version.payload?.data) {
      throw new Error(`No data found for secret: ${secretName}`);
    }
    return version.payload.data.toString();
  } catch (error) {
    // Secret Managerへのアクセスエラーは詳細をログに出力
    console.error(`Failed to access secret ${secretName} from Secret Manager:`, error);
    // クライアントには一般的なエラーメッセージを返す
    throw new Error(`Failed to access secret: ${secretName}`);
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
    // 全体的な設定取得エラーは詳細をログに出力
    console.error('Error fetching Firebase configuration:', error);
    // クライアントには一般的なエラーメッセージを返す
    return NextResponse.json(
      {
        error: 'Failed to fetch configuration',
        details: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
