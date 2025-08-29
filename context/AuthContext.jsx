"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider(props) {
  const { children } = props;
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setCurrentUser(null);
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Authenticating user ...");
      setIsLoadingUser(true);
      try {
        setCurrentUser(user);

        if (!user) {
          // guard clause which means that if there i no user then we just throw an error and we don't run the code below and we don't do any data fetching.
          throw Error("No user found.");
        }
        console.log("User found.");
        // if we find a user, then fetch their data
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoadingUser(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isLoadingUser,
    signup,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
