import type { Control, FieldValues, Path } from "react-hook-form";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

const switchInputVariants = cva(
  "flex w-full flex-row items-center justify-between p-4",
  {
    variants: {
      variant: {
        default: "rounded-lg border dark:border-stone-800 dark:bg-stone-950",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ConnectionSwitchInputProps<T extends FieldValues>
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof switchInputVariants> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description: string;
  disabled?: boolean;
}

export default function ConnectionSwitchInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  className,
  variant,
  disabled = false,
  ...props
}: ConnectionSwitchInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(switchInputVariants({ variant }), className)}
          {...props}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
