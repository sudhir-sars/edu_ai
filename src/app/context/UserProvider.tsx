'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserContext } from '../types';

interface UserProviderValue {
  user: UserContext | null;
  setUser: (user: UserContext | null) => void;
}

const UserContextReact = createContext<UserProviderValue>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContext | null>(null);

  return (
    <UserContextReact.Provider value={{ user, setUser }}>
      {children}
    </UserContextReact.Provider>
  );
};

export const useUser = () => useContext(UserContextReact);
