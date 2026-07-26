import { isFirebaseConfigured, db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { UserProfile, Transaction, SavingsGoal, CreditCard } from '../types';

// LOCAL STORAGE FALLBACK HELPERS
const getLocalData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // USER PROFILE SERVICES
  async getUserProfile(uid: string, isGuest: boolean): Promise<UserProfile | null> {
    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
      } catch (error) {
        console.error('Firestore getUserProfile error (using local backup):', error);
      }
    }
    
    // Fallback to LocalStorage
    const profileStr = localStorage.getItem(`rpg_profile_${uid}`);
    if (profileStr) {
      return JSON.parse(profileStr) as UserProfile;
    }
    return null;
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const key = `rpg_profile_${profile.uid}`;
    localStorage.setItem(key, JSON.stringify(profile));

    if (isFirebaseConfigured && !profile.isGuest && db) {
      try {
        const docRef = doc(db, 'users', profile.uid);
        await setDoc(docRef, profile, { merge: true });
      } catch (error) {
        console.error('Firestore saveUserProfile error (saved locally):', error);
      }
    }
  },

  // TRANSACTION SERVICES
  async getTransactions(userId: string, isGuest: boolean): Promise<Transaction[]> {
    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const colRef = collection(db, 'users', userId, 'transactions');
        const q = query(colRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setLocalData(`rpg_txs_${userId}`, transactions);
        return transactions;
      } catch (error) {
        console.error('Firestore getTransactions error (using local backup):', error);
      }
    }

    // Local Storage
    return getLocalData<Transaction>(`rpg_txs_${userId}`).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  async addTransaction(
    userId: string,
    isGuest: boolean,
    t: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ): Promise<Transaction> {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: Date.now(),
    };

    // Save locally first
    const txs = getLocalData<Transaction>(`rpg_txs_${userId}`);
    txs.push(newTx);
    setLocalData(`rpg_txs_${userId}`, txs);

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const colRef = collection(db, 'users', userId, 'transactions');
        // Let Firestore generate its own doc, but we use the return value
        const docRef = await addDoc(colRef, {
          amount: newTx.amount,
          type: newTx.type,
          category: newTx.category,
          description: newTx.description,
          date: newTx.date,
          cardId: newTx.cardId,
          paymentMethod: newTx.paymentMethod || null,
          createdAt: newTx.createdAt,
          userId: newTx.userId,
        });
        // Sync our local version with the firestore ID
        const index = txs.findIndex((x) => x.id === newTx.id);
        if (index > -1) {
          txs[index].id = docRef.id;
          setLocalData(`rpg_txs_${userId}`, txs);
          newTx.id = docRef.id;
        }
      } catch (error) {
        console.error('Firestore addTransaction error (saved locally):', error);
      }
    }

    return newTx;
  },

  async updateTransaction(
    userId: string,
    isGuest: boolean,
    tx: Transaction
  ): Promise<void> {
    // Local update
    const txs = getLocalData<Transaction>(`rpg_txs_${userId}`);
    const index = txs.findIndex((t) => t.id === tx.id);
    if (index > -1) {
      txs[index] = tx;
      setLocalData(`rpg_txs_${userId}`, txs);
    }

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', userId, 'transactions', tx.id);
        await setDoc(docRef, {
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          description: tx.description,
          date: tx.date,
          cardId: tx.cardId,
        }, { merge: true });
      } catch (error) {
        console.error('Firestore updateTransaction error (updated locally):', error);
      }
    }
  },

  async deleteTransaction(
    userId: string,
    isGuest: boolean,
    id: string
  ): Promise<boolean> {
    // Local delete
    const txs = getLocalData<Transaction>(`rpg_txs_${userId}`);
    const exists = txs.some((t) => t.id === id);
    if (!exists) return false;

    const filtered = txs.filter((t) => t.id !== id);
    setLocalData(`rpg_txs_${userId}`, filtered);

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', userId, 'transactions', id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Firestore deleteTransaction error (deleted locally):', error);
      }
    }
    return true;
  },

  // SAVINGS GOAL SERVICES
  async getGoals(userId: string, isGuest: boolean): Promise<SavingsGoal[]> {
    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const colRef = collection(db, 'users', userId, 'goals');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const goals: SavingsGoal[] = [];
        querySnapshot.forEach((doc) => {
          goals.push({ id: doc.id, ...doc.data() } as SavingsGoal);
        });
        setLocalData(`rpg_goals_${userId}`, goals);
        return goals;
      } catch (error) {
        console.error('Firestore getGoals error (using local backup):', error);
      }
    }

    return getLocalData<SavingsGoal>(`rpg_goals_${userId}`);
  },

  async addGoal(
    userId: string,
    isGuest: boolean,
    g: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'status'>
  ): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      ...g,
      id: Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: Date.now(),
      status: 'active',
    };

    const goals = getLocalData<SavingsGoal>(`rpg_goals_${userId}`);
    goals.push(newGoal);
    setLocalData(`rpg_goals_${userId}`, goals);

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const colRef = collection(db, 'users', userId, 'goals');
        const docRef = await addDoc(colRef, {
          name: newGoal.name,
          targetAmount: newGoal.targetAmount,
          currentAmount: newGoal.currentAmount,
          category: newGoal.category,
          deadline: newGoal.deadline,
          status: newGoal.status,
          createdAt: newGoal.createdAt,
          userId: newGoal.userId,
        });
        const index = goals.findIndex((x) => x.id === newGoal.id);
        if (index > -1) {
          goals[index].id = docRef.id;
          setLocalData(`rpg_goals_${userId}`, goals);
          newGoal.id = docRef.id;
        }
      } catch (error) {
        console.error('Firestore addGoal error:', error);
      }
    }

    return newGoal;
  },

  async updateGoal(
    userId: string,
    isGuest: boolean,
    goal: SavingsGoal
  ): Promise<void> {
    const goals = getLocalData<SavingsGoal>(`rpg_goals_${userId}`);
    const index = goals.findIndex((g) => g.id === goal.id);
    if (index > -1) {
      goals[index] = goal;
      setLocalData(`rpg_goals_${userId}`, goals);
    }

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', userId, 'goals', goal.id);
        await setDoc(docRef, {
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          category: goal.category,
          deadline: goal.deadline,
          status: goal.status,
        }, { merge: true });
      } catch (error) {
        console.error('Firestore updateGoal error:', error);
      }
    }
  },

  async deleteGoal(
    userId: string,
    isGuest: boolean,
    id: string
  ): Promise<boolean> {
    const goals = getLocalData<SavingsGoal>(`rpg_goals_${userId}`);
    const exists = goals.some((g) => g.id === id);
    if (!exists) return false;

    const filtered = goals.filter((g) => g.id !== id);
    setLocalData(`rpg_goals_${userId}`, filtered);

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', userId, 'goals', id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Firestore deleteGoal error:', error);
      }
    }
    return true;
  },

  // CREDIT CARD SERVICES (EQUIPPABLE RELICS)
  async getCreditCards(userId: string, isGuest: boolean): Promise<CreditCard[]> {
    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const colRef = collection(db, 'users', userId, 'creditCards');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const cards: CreditCard[] = [];
        querySnapshot.forEach((doc) => {
          cards.push({ id: doc.id, ...doc.data() } as CreditCard);
        });
        setLocalData(`rpg_cards_${userId}`, cards);
        return cards;
      } catch (error) {
        console.error('Firestore getCreditCards error (using local backup):', error);
      }
    }

    return getLocalData<CreditCard>(`rpg_cards_${userId}`);
  },

  async addCreditCard(
    userId: string,
    isGuest: boolean,
    c: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>
  ): Promise<CreditCard> {
    const newCard: CreditCard = {
      ...c,
      id: Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: Date.now(),
    };

    const cards = getLocalData<CreditCard>(`rpg_cards_${userId}`);
    cards.push(newCard);
    setLocalData(`rpg_cards_${userId}`, cards);

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const colRef = collection(db, 'users', userId, 'creditCards');
        const docRef = await addDoc(colRef, {
          name: newCard.name,
          limit: newCard.limit,
          balance: newCard.balance,
          dueDate: newCard.dueDate,
          statementDate: newCard.statementDate,
          color: newCard.color,
          rarity: newCard.rarity,
          createdAt: newCard.createdAt,
          userId: newCard.userId,
        });
        const index = cards.findIndex((x) => x.id === newCard.id);
        if (index > -1) {
          cards[index].id = docRef.id;
          setLocalData(`rpg_cards_${userId}`, cards);
          newCard.id = docRef.id;
        }
      } catch (error) {
        console.error('Firestore addCreditCard error:', error);
      }
    }

    return newCard;
  },

  async updateCreditCard(
    userId: string,
    isGuest: boolean,
    card: CreditCard
  ): Promise<void> {
    const cards = getLocalData<CreditCard>(`rpg_cards_${userId}`);
    const index = cards.findIndex((c) => c.id === card.id);
    if (index > -1) {
      cards[index] = card;
      setLocalData(`rpg_cards_${userId}`, cards);
    }

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', userId, 'creditCards', card.id);
        await setDoc(docRef, {
          name: card.name,
          limit: card.limit,
          balance: card.balance,
          dueDate: card.dueDate,
          statementDate: card.statementDate,
          color: card.color,
          rarity: card.rarity,
        }, { merge: true });
      } catch (error) {
        console.error('Firestore updateCreditCard error:', error);
      }
    }
  },

  async deleteCreditCard(
    userId: string,
    isGuest: boolean,
    id: string
  ): Promise<void> {
    const cards = getLocalData<CreditCard>(`rpg_cards_${userId}`);
    const filtered = cards.filter((c) => c.id !== id);
    setLocalData(`rpg_cards_${userId}`, filtered);

    if (isFirebaseConfigured && !isGuest && db) {
      try {
        const docRef = doc(db, 'users', userId, 'creditCards', id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Firestore deleteCreditCard error:', error);
      }
    }
  },

  // PORT GUEST DATA TO FIREBASE (Sync local guest details to newly registered Firebase user)
  async migrateGuestData(guestUid: string, userUid: string): Promise<void> {
    try {
      const txs = getLocalData<Transaction>(`rpg_txs_${guestUid}`);
      const cards = getLocalData<CreditCard>(`rpg_cards_${guestUid}`);
      const goals = getLocalData<SavingsGoal>(`rpg_goals_${guestUid}`);
      const profile = localStorage.getItem(`rpg_profile_${guestUid}`);

      // Save transactions, cards, and goals under the new user ID
      if (profile) {
        const parsedProfile = JSON.parse(profile) as UserProfile;
        parsedProfile.uid = userUid;
        parsedProfile.isGuest = false;
        await this.saveUserProfile(parsedProfile);
      }

      // Write all to new Firestore/Local records
      for (const t of txs) {
        await this.addTransaction(userUid, false, {
          amount: t.amount,
          type: t.type,
          category: t.category,
          description: t.description,
          date: t.date,
          cardId: t.cardId,
          paymentMethod: t.paymentMethod,
        });
      }

      for (const c of cards) {
        await this.addCreditCard(userUid, false, {
          name: c.name,
          limit: c.limit,
          balance: c.balance,
          dueDate: c.dueDate,
          statementDate: c.statementDate,
          color: c.color,
          rarity: c.rarity,
        });
      }

      for (const g of goals) {
        await this.addGoal(userUid, false, {
          name: g.name,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          category: g.category,
          deadline: g.deadline,
        });
      }

      // Clean up local guest data
      localStorage.removeItem(`rpg_profile_${guestUid}`);
      localStorage.removeItem(`rpg_txs_${guestUid}`);
      localStorage.removeItem(`rpg_cards_${guestUid}`);
      localStorage.removeItem(`rpg_goals_${guestUid}`);
    } catch (error) {
      console.error('Error migrating guest data to Firebase:', error);
    }
  },
};
export default dbService;
