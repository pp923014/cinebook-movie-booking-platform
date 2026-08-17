import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cinebook_user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(data) {
    localStorage.setItem('cinebook_token', data.token);
    localStorage.setItem('cinebook_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('cinebook_token');
    localStorage.removeItem('cinebook_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
