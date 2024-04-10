import type * as z from "zod";
import { type Control, type Path } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";

export interface SharedInputNoNameProps<T extends z.ZodType> {
  control: Control<z.infer<T>>;
  label?: string;
  description?: string;
}

export interface SharedInputProps<T extends z.ZodType>
  extends SharedInputNoNameProps<T>,
    React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<z.infer<T>>;
}

function FormInput<T extends z.ZodType>({
  control,
  name,
  label,
  description,
  ...inputProps
}: SharedInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input {...inputProps} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export interface SharedTextareaProps<T extends z.ZodType>
  extends SharedInputNoNameProps<T>,
    TextareaProps {
  name: Path<z.infer<T>>;
}
function FormTextarea<T extends z.ZodType>({
  control,
  name,
  label,
  description,
  ...textareaProps
}: SharedTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea autoSize={true} {...textareaProps} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface NumPeriodInputs<T extends z.ZodType>
  extends SharedInputNoNameProps<T> {
  numName: Path<z.infer<T>>;
  periodName: Path<z.infer<T>>;
  numGreaterThanOne: boolean;
}
function NumPeriodInputs<T extends z.ZodType>({
  numName,
  numGreaterThanOne,
  periodName,
  control,
  label,
  description,
}: NumPeriodInputs<T>) {
  return (
    <div className="flex flex-1 items-start justify-evenly gap-4">
      <FormField
        control={control}
        name={numName}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel hidden htmlFor={numName}>
              {label}
            </FormLabel>
            <Input
              placeholder="Number"
              type="number"
              id={numName}
              {...field}
              onChange={(e) =>
                field.onChange(parseInt(e.target.value, 10) || undefined)
              }
            />
            <FormMessage className="col-span-full" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={periodName}
        render={({ field }) => (
          <FormItem className="flex-1 space-y-0">
            <FormLabel className="hidden">{label}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              name={periodName}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel hidden>{label}</SelectLabel>
                  <SelectItem value="years">
                    Year{numGreaterThanOne ? "s" : ""}
                  </SelectItem>
                  <SelectItem value="months">
                    Month{numGreaterThanOne ? "s" : ""}
                  </SelectItem>
                  <SelectItem value="weeks">
                    Week{numGreaterThanOne ? "s" : ""}
                  </SelectItem>
                  <SelectItem value="days">
                    Day{numGreaterThanOne ? "s" : ""}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage className="col-span-full" />
          </FormItem>
        )}
      />
    </div>
  );
}

function DateTimeInput<T extends z.ZodType>({
  control,
  name,
  label,
  description,
}: SharedInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="datetime-local"
              {...field}
              value={
                field.value
                  ? new Date(field.value).toISOString().slice(0, 16)
                  : undefined
              }
              onChange={(e) => field.onChange(new Date(e.target.value))}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface BooleanSelectProps<T extends z.ZodType> extends SharedInputProps<T> {
  placeholder?: "no" | "yes";
}
function BooleanSelect<T extends z.ZodType>({
  control,
  name,
  label,
  description,
  placeholder = "no",
}: BooleanSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value as string}
            name={name}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectLabel hidden>{label}</SelectLabel>
                <SelectItem value={"yes"}>Yes</SelectItem>
                <SelectItem value={"no"}>No</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CheckboxInput<T extends z.ZodType>({
  control,
  description,
  name,
  label,
  className,
}: SharedInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-start space-x-3 space-y-0 px-4 pb-4 pt-8",
            className,
          )}
        >
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}

export {
  FormInput,
  FormTextarea,
  NumPeriodInputs,
  DateTimeInput,
  BooleanSelect,
  CheckboxInput,
};
