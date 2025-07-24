import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  register: boolean;
  login: () => void;
  logout: () => void;
  redirectToLogin: ()=>void;
  redirectToRegister: ()=>void;
  cancelRegister: ()=>void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const [register, setRegister] = useState(false);
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);
    const redirectToLogin = () => setIsAuthenticated(false);
    const redirectToRegister= () => setRegister(true);
    const cancelRegister=()=> setRegister(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, register, login, logout, redirectToLogin, redirectToRegister, cancelRegister }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

