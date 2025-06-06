import { collection, addDoc, getDocs, query, orderBy, Firestore } from 'firebase/firestore';
import { getDb } from './firebase';
import type { FormData } from '@/app/page';

export const saveContactForm = async (data: FormData) => {
  try {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving contact form:', error);
    throw error;
  }
};

export const getContactForms = async () => {
  try {
    const db = await getDb();
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting contact forms:', error);
    throw error;
  }
}; 