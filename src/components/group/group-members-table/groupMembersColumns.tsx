import type { ColumnDef } from "@tanstack/react-table";
import parsePhoneNumber from "libphonenumber-js";

import { Checkbox } from "@/components/ui/checkbox";

import { HoverableCell } from "@/components/ui/hover-card";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import type { IContact } from "@/server/api/routers/contact";
import {
  Controller,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

type IGroupMembersFormShape = FieldValues & {
  selected: Record<string, boolean>;
};

export const getGroupMembersColumns = <T extends IGroupMembersFormShape>(
  form?: UseFormReturn<T>,
): ColumnDef<IContact>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        return form ? (
          <Controller
            control={form.control}
            // TODO wrong but tired
            name={`selected.${row.id}` as Path<T>}
            render={({ field }) => (
              <Checkbox
                checked={field.value || false}
                onChange={(e) =>
                  field.onChange((e.target as HTMLInputElement).checked)
                }
                aria-label="Select row"
              />
            )}
          />
        ) : (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phoneNumber = parsePhoneNumber(row.getValue<string>("phone"));

        return phoneNumber
          ? phoneNumber.formatNational()
          : row.getValue<string>("phone");
      },
    },
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Notes"
          className="flex-1"
        />
      ),
      cell: ({ row }) => <HoverableCell row={row} accessorKey="notes" />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(row.getValue<string>("id"))
            }
            className="w-48"
          >
            Copy member ID
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View member details</DropdownMenuItem>
          <DropdownMenuItem>
            Remove from group
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DataTableRowActions>
      ),
    },
  ];
};
