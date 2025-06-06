'use client';

import { useState } from 'react';
import type { FormData } from '@/app/page';

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
  initialData: FormData;
}

export default function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '氏名は必須項目です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須項目です';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.service) {
      newErrors.service = 'サービスは必須項目です';
    }

    if (!formData.category) {
      newErrors.category = 'カテゴリーは必須項目です';
    }

    if (formData.plans.length === 0) {
      newErrors.plans = 'プランを1つ以上選択してください';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'お問い合わせ内容は必須項目です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handlePlanChange = (plan: string) => {
    const newPlans = formData.plans.includes(plan)
      ? formData.plans.filter(p => p !== plan)
      : [...formData.plans, plan];
    setFormData({ ...formData, plans: newPlans });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>お問い合わせフォーム</h1>
      
      <div className="form-group">
        <label className="form-label">
          氏名
          <span className="required">必須</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          メールアドレス
          <span className="required">必須</span>
        </label>
        <input
          type="email"
          className="form-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          サービス
          <span className="required">必須</span>
        </label>
        <select
          className="form-select"
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
        >
          <option value="">選択してください</option>
          <option value="サービスA">サービスA</option>
        </select>
        {errors.service && <div className="error-message">{errors.service}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          カテゴリー
          <span className="required">必須</span>
        </label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="category"
              value="カテゴリー1"
              checked={formData.category === 'カテゴリー1'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            カテゴリー1
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="category"
              value="カテゴリー2"
              checked={formData.category === 'カテゴリー2'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            カテゴリー2
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="category"
              value="カテゴリー3"
              checked={formData.category === 'カテゴリー3'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            カテゴリー3
          </label>
        </div>
        {errors.category && <div className="error-message">{errors.category}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          プラン
          <span className="required">必須</span>
        </label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.plans.includes('プランa')}
              onChange={() => handlePlanChange('プランa')}
            />
            プランa
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.plans.includes('プランb')}
              onChange={() => handlePlanChange('プランb')}
            />
            プランb
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.plans.includes('プランc')}
              onChange={() => handlePlanChange('プランc')}
            />
            プランc
          </label>
        </div>
        {errors.plans && <div className="error-message">{errors.plans}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          お問い合わせ内容
          <span className="required">必須</span>
        </label>
        <textarea
          className="textarea"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
        {errors.message && <div className="error-message">{errors.message}</div>}
      </div>

      <div className="button-group">
        <button type="submit" className="button button-primary">
          確認画面へ進む
        </button>
      </div>
    </form>
  );
} 