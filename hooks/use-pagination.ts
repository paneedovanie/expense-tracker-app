import { useState } from "react";

export interface UsePaginationProps {
  page?: number;
  perPage?: number;
}

export default function usePagination(props?: UsePaginationProps) {
  const [page, setPage] = useState(props?.page ?? 1);
  const [perPage, setPerPage] = useState(props?.perPage ?? 10);

  return {
    page,
    perPage,

    setPage,
    setPerPage,
  };
}
