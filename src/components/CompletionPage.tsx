'use client';

interface CompletionPageProps {
  onReturn: () => void;
}

export default function CompletionPage({ onReturn }: CompletionPageProps) {
  return (
    <div className="completion-message">
      <h2>お問い合わせを受け付けました</h2>
      <p>担当者から折り返しご連絡いたしますので、ご回答をお待ちください。</p>
      <div className="button-group" style={{ justifyContent: 'center' }}>
        <button type="button" className="button button-secondary" onClick={onReturn}>
          入力画面に戻る
        </button>
      </div>
    </div>
  );
} 