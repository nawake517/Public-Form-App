import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { FormData } from '@/app/page';

// メール送信用のトランスポーター設定を動的に作成する関数
async function createTransporter() {
  // 開発環境では.env.localから設定を取得
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // 本番環境ではSecret Managerから設定を取得
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to fetch email configuration');
    }
    const config = await response.json();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  } catch (error) {
    console.error('Error creating mail transporter:', error);
    throw new Error('Failed to initialize email service');
  }
}

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();
    const transporter = await createTransporter();

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
      from: process.env.NODE_ENV === 'development' 
        ? process.env.GMAIL_USER 
        : (await (await fetch('/api/config')).json()).email.user,
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