'use client';

import type { FormData } from '@/app/page';

interface ConfirmationPageProps {
  formData: FormData;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ConfirmationPage({
  formData,
  onConfirm,
  onBack,
}: ConfirmationPageProps) {
  return (
    <div>
      <h1>入力内容の確認</h1>
      <p>入力内容にお間違いないかご確認ください。</p>

      <table className="confirmation-table">
        <tbody>
          <tr>
            <th>氏名</th>
            <td>{formData.name}</td>
          </tr>
          <tr>
            <th>メールアドレス</th>
            <td>{formData.email}</td>
          </tr>
          <tr>
            <th>サービス</th>
            <td>{formData.service}</td>
          </tr>
          <tr>
            <th>カテゴリー</th>
            <td>{formData.category}</td>
          </tr>
          <tr>
            <th>プラン</th>
            <td>{formData.plans.join('・')}</td>
          </tr>
          <tr>
            <th>お問い合わせ内容</th>
            <td style={{ whiteSpace: 'pre-wrap' }}>{formData.message}</td>
          </tr>
        </tbody>
      </table>

      <div className="button-group">
        <button type="button" className="button button-secondary" onClick={onBack}>
          入力画面に戻る
        </button>
        <button type="button" className="button button-primary" onClick={onConfirm}>
          送信する
        </button>
      </div>
    </div>
  );
} 