import { NextResponse } from 'next/server';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    const value = process.env[secretName];
    if (!value) {
      console.error(`Debug: Environment variable ${secretName} is not set in development.`);
      throw new Error(`Environment variable ${secretName} is not set`);
    }
    return value;
  }

  // --- プロジェクトIDの取得ロジックを強化 ---
  let projectId: string | undefined;

  // 1. GOOGLE_CLOUD_PROJECT 環境変数から取得を試みる
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    projectId = process.env.GOOGLE_CLOUD_PROJECT;
    console.error('Debug: Project ID from GOOGLE_CLOUD_PROJECT:', projectId);
  } else if (process.env.FIREBASE_CONFIG) {
    // 2. FIREBASE_CONFIG から取得を試みる (JSONパースが必要)
    try {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      if (firebaseConfig.projectId) {
        projectId = firebaseConfig.projectId;
        console.error('Debug: Project ID from FIREBASE_CONFIG:', projectId);
      }
    } catch (e) {
      console.error('Debug: Error parsing FIREBASE_CONFIG:', e);
    }
  }

  // 3. 最終手段: ハードコードされたプロジェクトIDを使用 (公開情報のため安全)
  if (!projectId) {
    projectId = 'publicformapp'; // あなたのプロジェクトIDを直接指定
    console.error('Debug: Falling back to hardcoded Project ID:', projectId);
  }
  // --- プロジェクトIDの取得ロジック強化ここまで ---


  if (!projectId) { // ここに到達することはほぼないはず
    throw new Error('Project ID is not available in the environment from any source, and fallback failed.');
  }

  try {
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    console.error(`Debug: Attempting to access secret: ${name}`); // シークレットのパス全体をログに出力（デバッグのため一時的に）
    const [version] = await client.accessSecretVersion({ name });
    if (!version.payload?.data) {
        console.error(`Debug: No data found for secret: ${secretName}`);
        throw new Error(`No data found for secret: ${secretName}`);
    }
    console.error(`Debug: Secret ${secretName} successfully retrieved.`);
    return version.payload.data.toString();
  } catch (secretError) {
    console.error(`Debug: Secret Manager access error for ${secretName}:`, {
      message: secretError instanceof Error ? secretError.message : 'Unknown error',
      code: secretError instanceof Error && 'code' in secretError ? secretError['code'] : 'N/A', // gRPCエラーコード
      stack: secretError instanceof Error ? secretError.stack : 'N/A',
    });
    throw new Error(`Failed to access secret: ${secretName}. Details: ${secretError instanceof Error ? secretError.message : 'Unknown error'}`);
  }
}

export async function GET() {
  try {
    console.error('Debug: Starting config retrieval.');

    const config = {
      apiKey: await getSecret('NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: await getSecret('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: await getSecret('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: await getSecret('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: await getSecret('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: await getSecret('NEXT_PUBLIC_FIREBASE_APP_ID'),
    };

    console.error('Debug: Configuration successfully retrieved.');
    return NextResponse.json(config);
  } catch (error) {
    console.error('Debug: Error fetching configuration in GET handler:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch configuration',
        details: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
