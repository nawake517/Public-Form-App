import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { FormData } from '@/app/page';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getEmailSecret(secretName: string): Promise<string> {
  // 開発環境では.env.localから取得
  if (process.env.NODE_ENV === 'development') {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Environment variable ${secretName} is not set in development environment.`);
    }
    return value;
  }

  // 本番環境ではFirebase設定からプロジェクトIDを取得
  let projectId: string | undefined;

  if (process.env.FIREBASE_CONFIG) {
    try {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      projectId = firebaseConfig.projectId;
    } catch (e) {
      console.error('Error parsing FIREBASE_CONFIG:', e);
      throw new Error('Failed to get project ID');
    }
  }

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
    console.error(`Error accessing secret ${secretName}:`, error);
    throw new Error('Failed to access email configuration');
  }
}

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();

    // メール設定を取得
    const emailUser = await getEmailSecret('GMAIL_USER');
    const emailPassword = await getEmailSecret('GMAIL_APP_PASSWORD');

    // トランスポーターの作成
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    // メール本文の作成
    const mailBody = `
お問い合わせがありました。

■ 氏名
${formData.name}

■ メールアドレス
${formData.email}

■ サービス
${formData.service}

■ カテゴリー
${formData.category}

■ プラン
${formData.plans.join('・')}

■ お問い合わせ内容
${formData.message}
    `;

    // メール送信オプションの設定
    const mailOptions = {
      from: emailUser,
      to: 'naoki130517@gmail.com',
      subject: '【お問い合わせ】新規のお問い合わせ',
      text: mailBody,
    };

    // メール送信
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 