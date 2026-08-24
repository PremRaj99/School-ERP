import { useState, type ReactNode } from 'react';
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  PiArrowDown,
  PiArrowUp,
  PiArrowsDownUp,
  PiDownload,
  PiSlidersHorizontal,
  PiMagnifyingGlass,
  PiTray,
} from 'react-icons/pi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadCsv } from './csv';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  /** Rendered instead of the table when `data` is empty and not loading. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  searchPlaceholder?: string;
  /** Extra filter controls (multi-select chips, etc.) rendered next to the search box. */
  toolbar?: ReactNode;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  enableRowSelection?: boolean;
  /** Rendered in place of the search bar once at least one row is selected. */
  bulkActions?: (selected: TData[], clearSelection: () => void) => ReactNode;
  /** When set, adds an "Export CSV" button using these columns' `header`/`accessorKey`. Only
   * exports the currently-loaded rows — in `manual` mode that's the current page, not every row. */
  exportFilename?: string;
  /** Switches to server-side pagination/search/sort — see `ManualDataTableState`. Omit for the
   * default client-side behavior (search/sort/paginate the full `data` array in the browser). */
  manual?: ManualDataTableState;
}

/**
 * Hands control of pagination/search/sort to the caller instead of the table doing it client-side
 * against the full `data` array — pass this once a list endpoint actually paginates server-side
 * (ALIGNMENT_PLAN.md 2C/P1). `data` should then be just the current page's rows, and `totalRows`/
 * `pageCount` come from the server response's `total`/`totalPages`.
 */
export interface ManualDataTableState {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
}

/**
 * The one table every list page should use instead of a bespoke `<Table>` (ALIGNMENT_PLAN.md
 * Part 3.1) — search, sort, pagination, column visibility, row selection, and CSV export, all
 * client-side for now (the backend doesn't paginate yet — ALIGNMENT_PLAN.md 2C/P1 — so there's
 * nothing to page against server-side; this switches over once that lands, same props).
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'No records to show.',
  emptyAction,
  searchPlaceholder = 'Search…',
  toolbar,
  onRowClick,
  pageSize = 10,
  enableRowSelection = false,
  bulkActions,
  exportFilename,
  manual,
}: DataTableProps<TData>) {
  const isManual = !!manual;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tableColumns: ColumnDef<TData, unknown>[] = enableRowSelection
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected()}
              onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
              aria-label="Select all rows on this page"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) => row.toggleSelected(!!checked)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting: isManual ? manual.sorting : sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
      ...(isManual
        ? { pagination: { pageIndex: manual.pageIndex, pageSize: manual.pageSize } }
        : {}),
    },
    onSortingChange: isManual
      ? (updater) =>
          manual.onSortingChange(typeof updater === 'function' ? updater(manual.sorting) : updater)
      : setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: isManual
      ? (updater) => {
          const current = { pageIndex: manual.pageIndex, pageSize: manual.pageSize };
          const next = typeof updater === 'function' ? updater(current) : updater;
          manual.onPageChange(next.pageIndex);
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isManual ? undefined : getSortedRowModel(),
    getFilteredRowModel: isManual ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isManual ? undefined : getPaginationRowModel(),
    manualPagination: isManual,
    manualSorting: isManual,
    pageCount: isManual ? manual.pageCount : undefined,
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  const handleExport = () => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((c) => c.id !== 'select' && c.id !== 'actions');
    const headers = visibleColumns.map((c) =>
      typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id,
    );
    const rows = table
      .getFilteredRowModel()
      .rows.map((row) => visibleColumns.map((c) => row.getValue(c.id)));
    downloadCsv(exportFilename ?? 'export', headers, rows);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full max-w-sm" />
        <div className="space-y-1.5 rounded-md border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // In manual mode, an empty current page doesn't necessarily mean there's no data at all (the
  // user could be on a now-out-of-range page after a filter change) — only show the empty state
  // when the server says there are genuinely zero matching rows.
  if (isManual ? manual.totalRows === 0 : data.length === 0) {
    return (
      <Empty className="rounded-md border">
        <EmptyMedia variant="icon">
          <PiTray className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{emptyTitle}</EmptyTitle>
        <EmptyDescription>{emptyDescription}</EmptyDescription>
        {emptyAction}
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {enableRowSelection && selectedRows.length > 0 && bulkActions ? (
          <div className="flex flex-1 items-center gap-2">
            {bulkActions(selectedRows, () => setRowSelection({}))}
          </div>
        ) : (
          <div className="relative max-w-sm flex-1">
            <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value={isManual ? manual.search : globalFilter}
              onChange={(e) =>
                isManual ? manual.onSearchChange(e.target.value) : setGlobalFilter(e.target.value)
              }
              className="h-9 pl-8 text-xs"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {toolbar}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                  <PiSlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Columns</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {table
                .getAllLeafColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {exportFilename && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs"
              onClick={handleExport}
            >
              <PiDownload className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50/70 dark:bg-zinc-800/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <PiArrowUp className="h-3 w-3" />,
                          desc: <PiArrowDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <PiArrowsDownUp className="text-muted-foreground/50 h-3 w-3" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="text-muted-foreground py-8 text-center text-xs"
                >
                  No rows match your search.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={
                    onRowClick
                      ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {(() => {
            const total = isManual ? manual.totalRows : table.getFilteredRowModel().rows.length;
            if (enableRowSelection && selectedRows.length > 0) {
              return `${selectedRows.length} of ${total} selected`;
            }
            return `${total} row${total === 1 ? '' : 's'}`;
          })()}
        </span>
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
