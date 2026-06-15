import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const OrderPaymentsPagination = ({ page, meta, onPageChange, compact = false }) => {
  if (meta.totalPages <= 1) return null;

  const wrapperClass = compact
    ? 'pt-3 border-t border-gray-100'
    : 'border border-[#E0F2FE] rounded-2xl';

  const content = (
    <>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            let pageNum;
            if (meta.totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= meta.totalPages - 2) pageNum = meta.totalPages - 4 + i;
            else pageNum = page - 2 + i;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
              className={page >= meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="text-center text-sm text-gray-500 mt-2">
        Страница {page} из {meta.totalPages} • Всего {meta.total} платежей
      </div>
    </>
  );

  if (compact) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return (
    <Card className={wrapperClass}>
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
};

export default OrderPaymentsPagination;
