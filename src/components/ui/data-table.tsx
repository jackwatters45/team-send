import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import {
  flexRender,
  type Column,
  type ColumnDef,
  type Table as TableType,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  EyeNoneIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "./input";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface DataTableFilterProps<TData>
  extends InputHTMLAttributes<HTMLInputElement> {
  table: TableType<TData>;
  field?: string;
}
function DataTableFilter<TData>({
  table,
  field = "name",
  ...inputProps
}: DataTableFilterProps<TData>) {
  return (
    <Input
      value={(table.getColumn(field)?.getFilterValue() as string) ?? ""}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        table.getColumn(field)?.setFilterValue(event.target.value)
      }
      className="max-w-sm"
      {...inputProps}
    />
  );
}

interface DataTableColumnOptionsProps<TData> {
  table: TableType<TData>;
  triggerName?: string;
}
function DataTableColumnOptions<TData>({
  table,
  triggerName = "Columns",
}: DataTableColumnOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          {triggerName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent -ml-3 h-8"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface DataTableColumnToggleProps<TData> {
  table: TableType<TData>;
}
function DataTableColumnToggle<TData>({
  table,
}: DataTableColumnToggleProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DataTableRowActionsProps {
  children: React.ReactNode;
}
function DataTableRowActions({ children }: DataTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DataTableSelectedRowCountProps<TData> {
  table: TableType<TData>;
}
function DataTableSelectedRowCount<TData>({
  table,
}: DataTableSelectedRowCountProps<TData>) {
  return (
    <div className="text-muted-foreground flex-1 text-sm text-stone-400 dark:text-stone-400 ">
      {table.getFilteredSelectedRowModel().rows.length} of{" "}
      {table.getFilteredRowModel().rows.length} row(s) selected.
    </div>
  );
}

interface DataTablePaginationProps<TData> {
  table: TableType<TData>;
}
function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium text-stone-400 dark:text-stone-400 ">
          Rows per page
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value: string) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-[100px] items-center justify-center text-sm font-medium text-stone-400 dark:text-stone-400 ">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface GroupTableSkeletonProps {
  tableHeight?: number;
  includeFilter?: boolean;
  includeColumnOptions?: boolean;
  includeRowSelection?: boolean;
  includePagination?: boolean;
}
function DataTableSkeleton({
  tableHeight = 500,
  includeFilter = true,
  includeColumnOptions = true,
  includeRowSelection = true,
  includePagination = true,
}: GroupTableSkeletonProps) {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center pb-1 pt-4">
        {includeFilter && (
          <Skeleton className="flex h-10 w-full max-w-sm border border-stone-200 bg-white px-3 py-2 dark:border-stone-800  dark:bg-stone-900" />
        )}
        {includeColumnOptions && (
          <Skeleton className="ml-auto inline-flex h-10 w-[92px] border border-stone-200 bg-white px-4 py-2 transition-colors dark:border-stone-800 dark:bg-stone-900 " />
        )}
      </div>
      <Skeleton
        className={`w-full border border-stone-200  bg-transparent dark:border-stone-800 dark:bg-transparent`}
        style={{ height: tableHeight }}
      >
        <div style={{ height: "100%" }}></div>
      </Skeleton>
      <div className="flex items-center justify-between px-2">
        {includeRowSelection && (
          <Skeleton className="h-8 w-[100px] border border-stone-200 bg-white dark:border-stone-800  dark:bg-stone-900" />
        )}
        {includePagination && (
          <div className="flex items-center space-x-6 lg:space-x-8">
            <Skeleton className="h-8 w-[176px] border border-stone-200 bg-white dark:border-stone-800  dark:bg-stone-900" />
            <Skeleton className="h-8 w-[100px] border border-stone-200 bg-white dark:border-stone-800  dark:bg-stone-900" />
            <Skeleton className="h-8 w-[152px] border border-stone-200 bg-white dark:border-stone-800  dark:bg-stone-900" />
          </div>
        )}
      </div>
    </div>
  );
}

interface DataTableContentProps<TData, TValue> {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  link?: { pre: string; field: string };
}
function DataTableContent<TData, TValue>({
  table,
  columns,
  link,
}: DataTableContentProps<TData, TValue>) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => {
                const colId = cell.column.id;
                return link && colId !== "actions" && colId !== "select" ? (
                  <TableCell key={cell.id}>
                    <Link
                      href={`${link.pre}${row.getValue<string>(link.field)}`}
                      className="block p-4"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Link>
                  </TableCell>
                ) : (
                  <TableCell key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

interface DataTableProps {
  header: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
}
function DataTable({ header, content, footer }: DataTableProps) {
  return (
    <div>
      <div className="flex items-center py-4">{header}</div>
      <div className="rounded-md border dark:border-stone-700">{content}</div>
      <div className="flex items-center justify-between p-2">{footer}</div>
    </div>
  );
}

export {
  DataTableFilter,
  DataTableColumnOptions,
  DataTableColumnHeader,
  DataTableColumnToggle,
  DataTableRowActions,
  DataTableSelectedRowCount,
  DataTablePagination,
  DataTableSkeleton,
  DataTableContent,
  DataTable,
};
