'use client';

import { useState } from 'react';
import type { FormData, FormErrors } from '@/app/page';

// サービスごとの選択肢の定義
const SERVICE_OPTIONS = {
  'サービスA': {
    categories: ['カテゴリー1', 'カテゴリー2', 'カテゴリー3'],
    plans: ['プランa', 'プランb', 'プランc']
  },
  'サービスB': {
    categories: ['カテゴリー4', 'カテゴリー5', 'カテゴリー6'],
    plans: ['プランd', 'プランe', 'プランf']
  },
  'サービスC': {
    categories: ['カテゴリー7', 'カテゴリー8', 'カテゴリー9'],
    plans: ['プランg', 'プランh', 'プランi']
  }
};

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
  initialData: FormData;
}

export default function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  // サービス変更時の処理
  const handleServiceChange = (service: string) => {
    setFormData({
      ...formData,
      service,
      category: '',
      plans: []
    });
  };

  // 現在選択されているサービスのオプションを取得
  const currentServiceOptions = formData.service ? SERVICE_OPTIONS[formData.service as keyof typeof SERVICE_OPTIONS] : null;

  const validateForm = () => {
    const newErrors: FormErrors = {};

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

    if (!formData.message.trim()) {
      newErrors.message = 'お問い合わせ内容は必須項目です';
    } else if (formData.message.length > 100) {
      newErrors.message = 'お問い合わせ内容は100文字以内で入力してください';
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
      <h1>こちらは○○に関するお問い合わせフォームです。</h1>
      
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
          onChange={(e) => handleServiceChange(e.target.value)}
        >
          <option value="">選択してください</option>
          {Object.keys(SERVICE_OPTIONS).map((service) => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
        {errors.service && <div className="error-message">{errors.service}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          カテゴリー
          <span className="required">必須</span>
        </label>
        <div className="radio-group">
          {currentServiceOptions?.categories.map((category) => (
            <label key={category} className="radio-label">
              <input
                type="radio"
                name="category"
                value={category}
                checked={formData.category === category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              {category}
            </label>
          ))}
        </div>
        {errors.category && <div className="error-message">{errors.category}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          プラン
        </label>
        <div className="checkbox-group">
          {currentServiceOptions?.plans.map((plan) => (
            <label key={plan} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.plans.includes(plan)}
                onChange={() => handlePlanChange(plan)}
              />
              {plan}
            </label>
          ))}
        </div>
        {errors.plans && <div className="error-message">{errors.plans}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          お問い合わせ内容
          <span className="required">必須</span>
          <span className="character-limit">（100文字以内）</span>
        </label>
        <textarea
          className="textarea"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          maxLength={100}
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