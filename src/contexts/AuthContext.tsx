import React, { createContext, useContext, useState } from "react";
import { UserResponse } from "@/data/useUsersDatabase";

type AuthContextData = {
  user: UserResponse | null;
  signIn: (user: UserResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);

  function signIn(userData: UserResponse) {
    setUser(userData);
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}