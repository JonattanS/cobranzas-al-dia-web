
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'usuario' | 'admin';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canCreateMainFunctions: () => boolean;
  canDeleteMainFunctions: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [role, setRole] = useState<UserRole>('admin'); // Por defecto admin para testing

  const canCreateMainFunctions = () => role === 'admin';
  const canDeleteMainFunctions = () => role === 'admin';

  return (
    <UserContext.Provider value={{
      role,
      setRole,
      canCreateMainFunctions,
      canDeleteMainFunctions
    }}>
      {children}
    </UserContext.Provider>
  );
};
