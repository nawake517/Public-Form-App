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
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = e.target.value;
    setFormData(prev => ({
      ...prev,
      service,
      category: '',
      plans: []
    }));
  };

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

    // エラーがある場合、最初のエラー項目までスクロール
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // カテゴリーが選択された場合、エラーメッセージを消す
    if (name === 'category' && value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const handleFocus = (name: string) => {
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  return (
    <div>
      <p className="form-title">こちらは○○に関するお問い合わせフォームです。</p>
      
      <div className="form-container">
        <div className="form-group">
          <label className="form-label">
            氏名
            <span className="required">必須</span>
          </label>
          <input
            type="text"
            className="form-input"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => handleFocus('name')}
            placeholder="山田 太郎"
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            placeholder="mail@example.com"
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
            name="service"
            value={formData.service}
            onChange={handleServiceChange}
            onFocus={() => handleFocus('service')}
          >
            <option value="" className="placeholder-option">選択してください</option>
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
          <div className={`radio-group ${!formData.service ? 'disabled' : ''}`}>
            {formData.service 
              ? SERVICE_OPTIONS[formData.service as keyof typeof SERVICE_OPTIONS].categories.map((category) => (
                  <label key={category} className="radio-label">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={formData.category === category}
                      onChange={handleChange}
                      onFocus={() => handleFocus('category')}
                      disabled={!formData.service}
                    />
                    {category}
                  </label>
                ))
              : SERVICE_OPTIONS['サービスA'].categories.map((category) => (
                  <label key={category} className="radio-label">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={formData.category === category}
                      onChange={handleChange}
                      onFocus={() => handleFocus('category')}
                      disabled={true}
                    />
                    {category}
                  </label>
                ))
            }
          </div>
          {errors.category && <div className="error-message">{errors.category}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">プラン</label>
          <div className={`checkbox-group ${!formData.service ? 'disabled' : ''}`}>
            {formData.service 
              ? SERVICE_OPTIONS[formData.service as keyof typeof SERVICE_OPTIONS].plans.map((plan) => (
                  <label key={plan} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.plans.includes(plan)}
                      onChange={() => handlePlanChange(plan)}
                      disabled={!formData.service}
                    />
                    {plan}
                  </label>
                ))
              : SERVICE_OPTIONS['サービスA'].plans.map((plan) => (
                  <label key={plan} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.plans.includes(plan)}
                      onChange={() => handlePlanChange(plan)}
                      disabled={true}
                    />
                    {plan}
                  </label>
                ))
            }
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            お問い合わせ内容
            <span className="required">必須</span>
          </label>
          <textarea
            className="textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            onFocus={() => handleFocus('message')}
            maxLength={100}
            placeholder="お問い合わせ内容をご記入ください。"
          />
          {errors.message && <div className="error-message">{errors.message}</div>}
        </div>
      </div>

      <div className="button-group">
        <button type="submit" className="button button-primary" onClick={handleSubmit}>
          確認画面へ進む
        </button>
      </div>
    </div>
  );
} 