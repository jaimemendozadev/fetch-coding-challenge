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

  if (pagination === undefined || pagination.total_pages === 0) return;

  const handleChange = (evt: number) => {
    paginationOnChange(evt);
  };

  return (
    <HeroUIPagination
      isCompact={false}
      classNames={{
        wrapper: 'mr-auto ml-auto mb-44',
        item: 'bg-[#0098F3] text-white font-bold',
        cursor: 'bg-[#0098F3] text-white font-bold'
      }}
      page={pagination.page}
      total={pagination.total_pages}
      onChange={handleChange}
    />
  );
};
