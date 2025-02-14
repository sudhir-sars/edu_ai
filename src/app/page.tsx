'use client';

import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { PreFillForm } from './components/shared/PreFillForm';
import { GoogleTagManager } from './components/shared/GoogleTagManager';
import { UserContext } from './types';
import { ExploreView } from './components/Explore/ExploreView';
import { PlaygroundView } from './components/Playground/PlaygroundView';
import { useUser } from './context/UserProvider';
export default function Home() {
  const { user, setUser } = useUser();

  const handleError = (message: string) => {
    toast.error(message);
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <PreFillForm onSubmit={(context) => setUser(context)} />
      </div>
    );
  }

  return (
    <>
      <GoogleTagManager />
      <div className="min-h-screen bg-background text-white bg-[#0f172a]">
        <Toaster position="top-right" />
        <Layout>
          <ExploreView onError={handleError} userContext={user} />
        </Layout>
      </div>
    </>
  );
}
