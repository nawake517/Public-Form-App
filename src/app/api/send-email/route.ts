import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { FormData } from '@/app/page';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getEmailSecret(secretName: string): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Environment variable ${secretName} is not set`);
    }
    return value;
  }

  let projectId: string | undefined;
  try {
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '');
    projectId = firebaseConfig.projectId;
  } catch (e) {
    throw new Error('Failed to get project ID');
  }

  if (!projectId) {
    throw new Error('Project ID not available');
  }

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`
    });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.error('Error accessing secret:', error);
    throw new Error('Failed to access configuration');
  }
}

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();
    const [emailUser, emailPassword] = await Promise.all([
      getEmailSecret('GMAIL_USER'),
      getEmailSecret('GMAIL_APP_PASSWORD')
    ]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPassword }
    });

    await transporter.sendMail({
      from: emailUser,
      to: 'naoki130517@gmail.com',
      subject: '【お問い合わせ】新規のお問い合わせ',
      text: `
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
      `.trim()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 