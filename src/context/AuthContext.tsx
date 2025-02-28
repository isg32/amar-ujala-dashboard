import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  signInWithCredential, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  sendOtp: (phoneNumber: string) => Promise<string>;
  verifyOtp: (verificationId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user is admin
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setIsAdmin(userSnap.data().role === 'admin');
          } else {
            // Create user document if it doesn't exist
            await setDoc(userRef, {
              phoneNumber: user.phoneNumber,
              role: 'user',
              createdAt: new Date()
            });
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendOtp = async (phoneNumber: string): Promise<string> => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      
      return verificationId;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  const verifyOtp = async (verificationId: string, otp: string): Promise<void> => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    sendOtp,
    verifyOtp,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};