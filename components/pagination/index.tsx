'use client';
import { ReactNode, useContext } from 'react';
import { Pagination as HeroUIPagination } from '@heroui/react';
import { StoreContext } from '@/utils/store';

interface PaginationProps {
  paginationOnChange: (pageNum: number) => void;
}
export const Pagination = ({
  paginationOnChange
}: PaginationProps): ReactNode => {
  const { store } = useContext(StoreContext);

  const { pagination } = store;

  // TODO: How do we handle when a search was empty with no results?
  if (pagination === undefined || pagination.total_pages === 0) return;

  const handleChange = (evt: number) => {
    console.log('evt in Pagination handleChange ', evt);
    console.log('\n');

    console.log('typeof evt in Pagination handleChange ', typeof evt);
    console.log('\n');

    paginationOnChange(evt);
  };

  return (
    <HeroUIPagination
      isCompact={false}
      classNames={{
        wrapper: 'mr-auto ml-auto mb-28',
        item: 'bg-[#0098F3] text-white font-bold',
        cursor: 'bg-[#0098F3] text-white font-bold'
      }}
      page={pagination.page}
      total={pagination.total_pages}
      onChange={handleChange}
    />
  );
};
