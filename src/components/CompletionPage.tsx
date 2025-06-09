'use client';

interface CompletionPageProps {
  onReturn: () => void;
}

export default function CompletionPage({ onReturn }: CompletionPageProps) {
  return (
    <div>
      <div className="completion-container">
        <p className="completion-title">お問い合わせが送信されました。</p>
        <p className="completion-message">担当者から折り返しご連絡いたしますので、ご回答をお待ちください。</p>
      </div>

      <div className="button-group">
        <button type="button" className="button button-secondary" onClick={onReturn}>
          入力画面に戻る
        </button>
      </div>
    </div>
  );
} 