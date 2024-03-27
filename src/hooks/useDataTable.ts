import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type TableOptions,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableOption<T> {
  initial?: T;
  include?: boolean;
}

interface UseDataTableOptions {
  columnVisibility?: DataTableOption<VisibilityState>;
  columnFilters?: DataTableOption<ColumnFiltersState>;
  rowSelection?: DataTableOption<RowSelectionState>;
  sorting?: DataTableOption<SortingState>;
  pagination?: { include: boolean };
}

export interface UseDataTableProps<TData, TValue>
  extends Partial<TableOptions<TData>> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  options?: UseDataTableOptions;
}

export default function useDataTable<TData, TValue>({
  columns,
  data,
  options,
  ...props
}: UseDataTableProps<TData, TValue>) {
  let args = { ...props, getCoreRowModel: getCoreRowModel() };
  let state = {};

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    options?.columnFilters?.initial ?? [],
  );
  if (options?.columnFilters?.include !== false) {
    args = {
      ...args,
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    };
    state = { ...state, columnFilters };
  }

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    options?.columnVisibility?.initial ?? { id: false },
  );
  if (options?.columnVisibility?.include !== false) {
    args = { ...args, onColumnVisibilityChange: setColumnVisibility };
    state = { ...state, columnVisibility };
  }

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    options?.rowSelection?.initial ?? {},
  );
  if (options?.rowSelection?.include !== false) {
    args = { ...args, onRowSelectionChange: setRowSelection };
    state = { ...state, rowSelection };
  }

  const [sorting, setSorting] = useState<SortingState>(
    options?.sorting?.initial ?? [],
  );
  if (options?.sorting?.include !== false) {
    args = {
      ...args,
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    };
    state = { ...state, sorting };
  }

  if (options?.pagination?.include !== false) {
    args = {
      ...args,
      getPaginationRowModel: getPaginationRowModel(),
    };
  }

  const table = useReactTable({
    data,
    columns,
    ...args,
    state,
  });

  return {
    table,
    rowSelection,
    setRowSelection,
    setColumnVisibility,
    setColumnFilters,
    setSorting,
  };
}
