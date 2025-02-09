'use client';
import { ReactNode, useContext, useState } from 'react';
import { Pagination as HeroUIPagination, Button } from '@heroui/react';
import { StoreContext } from '@/utils/store';

interface PaginationProps {
  buttonHandler: (pageNum: number) => void;
  paginationOnChange: (pageNum: number) => void;
}
export const Pagination = (): ReactNode => {
  const { store } = useContext(StoreContext);

  const { pagination } = store;

  // TODO: How do we handle when a search was empty with no results?
  if (pagination === undefined || pagination.total_pages === 0) return;

  const handleChange = (evt) => {
    console.log('evt in Pagination handleChange ', evt);
    console.log('\n');
  };

  return (
    <HeroUIPagination
      isCompact={false}
      classNames={{
        wrapper: 'border border-violet-500 mr-auto ml-auto',
        item: 'bg-[#0098F3] font-bold',
        cursor: 'bg-[#0098F3] font-bold'
      }}
      page={pagination.page}
      total={pagination.total_pages}
      onChange={handleChange}
    />
  );
};
