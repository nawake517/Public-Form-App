'use client';

import { useState } from 'react';
import ContactForm from '@/components/ContactForm';
import ConfirmationPage from '@/components/ConfirmationPage';
import CompletionPage from '@/components/CompletionPage';
import { saveContactForm } from '@/lib/firestore';

export type FormData = {
  name: string;
  email: string;
  service: string;
  category: string;
  plans: string[];
  message: string;
};

export type FormErrors = {
  name?: string;
  email?: string;
  service?: string;
  category?: string;
  plans?: string;
  message?: string;
};

export default function Home() {
  const [step, setStep] = useState<'form' | 'confirm' | 'complete'>('form');
  const initialFormData: FormData = {
    name: '',
    email: '',
    service: '',
    category: '',
    plans: [],
    message: ''
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string>('');

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      // Firestoreにデータを保存
      await saveContactForm(formData);

      // メール送信
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setStep('complete');
    } catch (error) {
      setError('送信に失敗しました。もう一度お試しください。');
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const handleBack = () => {
    setStep('form');
    setError('');
  };

  const handleReturnToForm = () => {
    setFormData({
      name: '',
      email: '',
      service: '',
      category: '',
      plans: [],
      message: '',
    });
    setStep('form');
    setError('');
  };

  return (
    <main className="container">
      {error && <div className="error-message">{error}</div>}
      {step === 'form' && (
        <ContactForm onSubmit={handleFormSubmit} initialData={formData} />
      )}
      {step === 'confirm' && (
        <ConfirmationPage
          formData={formData}
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      {step === 'complete' && (
        <CompletionPage onReturn={handleReturnToForm} />
      )}
    </main>
  );
}
