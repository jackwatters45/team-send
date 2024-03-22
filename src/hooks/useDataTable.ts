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

export interface UseDataTableProps<TData, TValue>
  extends Partial<TableOptions<TData>> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  includeFilter?: boolean;
  includeColumnOptions?: boolean;
  includeRowSelection?: boolean;
  includePagination?: boolean;
  includeSorting?: boolean;
}

export default function useDataTable<TData, TValue>({
  columns,
  data,
  includeFilter = true,
  includeColumnOptions = true,
  includeRowSelection = true,
  includePagination = true,
  includeSorting = true,
  state: otherState,
  ...props
}: UseDataTableProps<TData, TValue>) {
  let args = { ...props, getCoreRowModel: getCoreRowModel() };
  let state = { ...otherState };

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  if (includeFilter) {
    args = {
      ...args,
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    };
    state = { ...state, columnFilters };
  }

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
  });
  if (includeColumnOptions) {
    args = { ...args, onColumnVisibilityChange: setColumnVisibility };
    state = { ...state, columnVisibility };
  }

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  if (includeRowSelection) {
    args = { ...args, onRowSelectionChange: setRowSelection };
    state = { ...state, rowSelection };
  }

  const [sorting, setSorting] = useState<SortingState>([]);
  if (includeSorting) {
    args = {
      ...args,
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    };
    state = { ...state, sorting };
  }

  if (includePagination) {
    args = {
      ...args,
      getPaginationRowModel: getPaginationRowModel(),
    };
  }

  const table = useReactTable({ data, columns, ...args, state });

  return {
    table,
    rowSelection,
    setRowSelection,
    setColumnVisibility,
    setColumnFilters,
    setSorting,
  };
}
