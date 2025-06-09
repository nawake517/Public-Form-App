'use client';

import { useState } from 'react';
import type { FormData } from '@/app/page';

interface ConfirmationPageProps {
  formData: FormData;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export default function ConfirmationPage({
  formData,
  onConfirm,
  onBack,
}: ConfirmationPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="form-title">⼊⼒内容にお間違いないかご確認ください。</p>

      <div className="confirmation-container">
        <div className="confirmation-item">
          <div className="confirmation-label">氏名</div>
          <div className="confirmation-value">{formData.name}</div>
        </div>

        <div className="confirmation-item">
          <div className="confirmation-label">メールアドレス</div>
          <div className="confirmation-value">{formData.email}</div>
        </div>

        <div className="confirmation-item">
          <div className="confirmation-label">サービス</div>
          <div className="confirmation-value">{formData.service}</div>
        </div>

        <div className="confirmation-item">
          <div className="confirmation-label">カテゴリー</div>
          <div className="confirmation-value">{formData.category}</div>
        </div>

        <div className="confirmation-item">
          <div className="confirmation-label">プラン</div>
          <div className="confirmation-value">{formData.plans.join('・')}</div>
        </div>

        <div className="confirmation-item">
          <div className="confirmation-label">お問い合わせ内容</div>
          <div className="confirmation-value" style={{ whiteSpace: 'pre-wrap' }}>{formData.message}</div>
        </div>
      </div>

      <div className="button-group">
        <button 
          type="button" 
          className="button button-secondary" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          入力画面に戻る
        </button>
        <button 
          type="button" 
          className="button button-primary" 
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="button-content">
              <div className="loading-spinner"></div>
              <span>送信中...</span>
            </div>
          ) : '送信する'}
        </button>
      </div>
    </div>
  );
} 