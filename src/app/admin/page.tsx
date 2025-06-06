'use client';

import { useEffect, useState } from 'react';
import { getContactForms } from '@/lib/firestore';
import type { FormData } from '@/app/page';

interface ContactFormWithMeta extends FormData {
  id: string;
  createdAt: Date;
}

export default function AdminPage() {
  const [contacts, setContacts] = useState<ContactFormWithMeta[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getContactForms();
        setContacts(data as ContactFormWithMeta[]);
      } catch (error) {
        setError('データの取得に失敗しました。');
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <div className="container">読み込み中...</div>;
  }

  if (error) {
    return <div className="container error-message">{error}</div>;
  }

  return (
    <div className="container">
      <h1>お問い合わせ一覧</h1>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>日時</th>
              <th>氏名</th>
              <th>メールアドレス</th>
              <th>サービス</th>
              <th>カテゴリー</th>
              <th>プラン</th>
              <th>お問い合わせ内容</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.createdAt.toLocaleString()}</td>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.service}</td>
                <td>{contact.category}</td>
                <td>{contact.plans.join('・')}</td>
                <td>
                  <div className="message-cell">
                    {contact.message}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 