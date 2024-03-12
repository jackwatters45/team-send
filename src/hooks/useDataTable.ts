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
  TableOptions,
  TableState,
} from "@tanstack/react-table";
import { useState } from "react";

function useDataTableFilter() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  return {
    columnFilters,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  };
}

function useDataTableSorting() {
  const [sorting, setSorting] = useState<SortingState>([]);

  return {
    sorting,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  };
}

function useDataTableRowSelection() {
  const [rowSelection, setRowSelection] = useState({});

  return {
    rowSelection,
    onRowSelectionChange: setRowSelection,
  };
}

function useDataTableColumnVisibility() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  return {
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
  };
}

export interface UseDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  includeFilter?: boolean;
  includeColumnOptions?: boolean;
  includeRowSelection?: boolean;
  includePagination?: boolean;
  includeSorting?: boolean;
}

function useDataTable<TData, TValue>({
  columns,
  data,
  includeFilter = true,
  includeColumnOptions = true,
  includeRowSelection = true,
  includePagination = true,
  includeSorting = true,
}: UseDataTableProps<TData, TValue>) {
  const { columnFilters, ...filterArgs } = useDataTableFilter();
  const { sorting, ...sortingArgs } = useDataTableSorting();
  const { columnVisibility, ...visibilityArgs } =
    useDataTableColumnVisibility();
  const { rowSelection, ...rowSelectionArgs } = useDataTableRowSelection();

  let args = {};
  let state = {};

  if (includeFilter) {
    args = { ...args, ...filterArgs };
    state = { ...state, columnFilters };
  }
  if (includeColumnOptions) {
    args = { ...args, ...visibilityArgs };
    state = { ...state, columnVisibility };
  }
  if (includeRowSelection) {
    args = { ...args, ...rowSelectionArgs };
    state = { ...state, rowSelection };
  }
  if (includeSorting) {
    args = { ...args, ...sortingArgs };
    state = { ...state, sorting };
  }
  if (includePagination) {
    args = {
      ...args,
      getPaginationRowModel: getPaginationRowModel(),
    };
  }

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...args,
    state,
  });
}

export {
  useDataTable,
  useDataTableFilter,
  useDataTableSorting,
  useDataTableRowSelection,
  useDataTableColumnVisibility,
};
