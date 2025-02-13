"use client";

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import type { AppProps } from 'next/app';
import '../styles/global.css';
import Header from '../components/Header';
import { UserProvider } from '../context/UserContext';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <ClerkProvider>
    <UserProvider>
      <Header />
      <Component {...pageProps} />
    </UserProvider>
  </ClerkProvider>
);

export default MyApp; 