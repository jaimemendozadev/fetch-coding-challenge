'use client';
import { ReactNode } from 'react';
import { useGetUser, } from '@/utils/hooks';
import { SearchForm } from '@/components/searchform';

export default function HomePage(): ReactNode {
  const user = useGetUser();

  console.log('user in HomePage 🏡 ', user);

  return (
    <div>
      <h1>Home Page 🏡</h1>
      <SearchForm />
    </div>
  );
}
