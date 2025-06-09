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
    } catch {
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
      throw new Error('Secret not found');
    }
    return version.payload.data.toString();
  } catch {
    throw new Error('Failed to access email configuration');
  }
}

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();

    const emailUser = await getEmailSecret('GMAIL_USER');
    const emailPassword = await getEmailSecret('GMAIL_APP_PASSWORD');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

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

    const mailOptions = {
      from: emailUser,
      to: await getEmailSecret('NOTIFICATION_EMAIL'),
      subject: '【お問い合わせ】新規のお問い合わせ',
      text: mailBody,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 