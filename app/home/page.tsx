'use client';
import { ReactNode } from 'react';
import { useGetUser, } from '@/utils/hooks';

export default function HomePage(): ReactNode {
  const user = useGetUser();

  console.log('user in HomePage 🏡 ', user);

  return (
    <div>
      <h1>Home Page 🏡</h1>
    </div>
  );
}
