import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { isFirebaseConfigured, auth } from '../config/firebase';
import { dbService } from '../services/dbService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginAsGuest: (name?: string) => Promise<UserProfile>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserStats: (xpGain: number, goldDiff: number, isStreakIncrement?: boolean) => Promise<UserProfile>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// RPG Ranks helper based on level
export const getRankName = (level: number): string => {
  if (level < 3) return 'Apprentice Saver';
  if (level < 6) return 'Frugal Squire';
  if (level < 10) return 'Budget Knight';
  if (level < 15) return 'Vault Sentinel';
  if (level < 20) return 'Gold Paladin';
  return 'Wealth Archmage';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize/Load user session
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Local Auth Mode
      const activeGuestId = localStorage.getItem('rpg_active_user_id');
      if (activeGuestId) {
        dbService.getUserProfile(activeGuestId, true).then((profile) => {
          if (profile) {
            setUser(profile);
            // Verify streak on mount
            verifyStreak(profile);
          } else {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
      return;
    }

    // Firebase Auth Mode
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        // Load Profile
        let profile = await dbService.getUserProfile(firebaseUser.uid, false);
        if (!profile) {
          // Check if guest migration exists
          const activeGuestId = localStorage.getItem('rpg_active_user_id');
          const isGuestSession = activeGuestId && activeGuestId.startsWith('guest_');

          // Initialize Profile
          const regName = localStorage.getItem('rpg_registration_name');
          profile = {
            uid: firebaseUser.uid,
            displayName: regName || firebaseUser.displayName || 'Unnamed Hero',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            level: 1,
            xp: 0,
            streak: 1,
            lastActive: new Date().toISOString().split('T')[0],
            rankName: getRankName(1),
            currencyGold: 0,
            isGuest: false,
          };
          
          if (isGuestSession && activeGuestId) {
            // Migrate guest data to new firebase user
            await dbService.migrateGuestData(activeGuestId, firebaseUser.uid);
            localStorage.removeItem('rpg_active_user_id');
            // Fetch newly migrated profile (will contain stats if saved during migration)
            const migrated = await dbService.getUserProfile(firebaseUser.uid, false);
            if (migrated) {
              profile = {
                ...migrated,
                displayName: regName || migrated.displayName,
              };
              await dbService.saveUserProfile(profile);
            }
          } else {
            await dbService.saveUserProfile(profile);
          }
          localStorage.removeItem('rpg_registration_name');
        }
        
        setUser(profile);
        verifyStreak(profile);
      } else {
        // Logged out from Firebase. Check if they fell back to local guest
        const activeGuestId = localStorage.getItem('rpg_active_user_id');
        if (activeGuestId && activeGuestId.startsWith('guest_')) {
          const profile = await dbService.getUserProfile(activeGuestId, true);
          if (profile) {
            setUser(profile);
            verifyStreak(profile);
            return;
          }
        }
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Check and update streaks
  const verifyStreak = async (profile: UserProfile) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActiveStr = profile.lastActive;

    if (lastActiveStr === todayStr) {
      setUser(profile);
      setLoading(false);
      return;
    }

    const lastDate = new Date(lastActiveStr);
    const todayDate = new Date(todayStr);
    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let updatedProfile = { ...profile, lastActive: todayStr };

    if (diffDays === 1) {
      // Increment Streak (Active consecutive day)
      updatedProfile.streak += 1;
      // Award 15 XP for daily streak
      updatedProfile = addXp(updatedProfile, 15);
    } else if (diffDays > 1) {
      // Streak broken
      updatedProfile.streak = 1;
    }

    await dbService.saveUserProfile(updatedProfile);
    setUser(updatedProfile);
    setLoading(false);
  };

  // Internal helper to calculate levels and add XP
  const addXp = (profile: UserProfile, xpGain: number): UserProfile => {
    let newXp = profile.xp + xpGain;
    let newLevel = profile.level;
    let leveledUp = false;

    while (true) {
      const xpNeeded = newLevel * 150;
      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
        leveledUp = true;
      } else {
        break;
      }
    }

    const updated = {
      ...profile,
      level: newLevel,
      xp: newXp,
      rankName: getRankName(newLevel),
    };

    if (leveledUp) {
      // Triggers custom UI event to let NotificationSystem know
      setTimeout(() => {
        const event = new CustomEvent('rpg-level-up', {
          detail: { level: newLevel, rankName: updated.rankName },
        });
        window.dispatchEvent(event);
      }, 300);
    }

    return updated;
  };

  // UPDATE XP & GOLD API
  const updateUserStats = async (xpGain: number, goldDiff: number, isStreakIncrement = false) => {
    if (!user) throw new Error('No active player session');

    let updated = { ...user };
    if (xpGain > 0) {
      updated = addXp(updated, xpGain);
    }
    
    updated.currencyGold = Math.max(0, updated.currencyGold + goldDiff);
    if (isStreakIncrement) {
      updated.streak += 1;
    }
    updated.lastActive = new Date().toISOString().split('T')[0];

    await dbService.saveUserProfile(updated);
    setUser(updated);
    return updated;
  };

  const updateUserProfile = async (updatedProfile: UserProfile) => {
    await dbService.saveUserProfile(updatedProfile);
    setUser(updatedProfile);
  };

  // ACTIONS
  const loginAsGuest = async (name = 'Guest Hero') => {
    setLoading(true);
    const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
    const guestProfile: UserProfile = {
      uid: guestId,
      displayName: name,
      email: null,
      photoURL: null,
      level: 1,
      xp: 0,
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0],
      rankName: getRankName(1),
      currencyGold: 0,
      isGuest: true,
    };
    await dbService.saveUserProfile(guestProfile);
    localStorage.setItem('rpg_active_user_id', guestId);
    setUser(guestProfile);
    setLoading(false);
    return guestProfile;
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured on this host.');
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured on this host.');
    }
    setLoading(true);
    try {
      localStorage.setItem('rpg_registration_name', name);
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCred.user, { displayName: name });
    } catch (err) {
      localStorage.removeItem('rpg_registration_name');
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured on this host.');
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('rpg_active_user_id');
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAsGuest,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateUserStats,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
