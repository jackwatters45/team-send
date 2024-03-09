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

export interface ISharedInputNoNameProps<T extends z.ZodType> {
  control: Control<z.infer<T>>;
  label?: string;
  description?: string;
}

export interface ISharedInputProps<T extends z.ZodType>
  extends ISharedInputNoNameProps<T>,
    React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<z.infer<T>>;
}

function FormInput<T extends z.ZodType>({
  control,
  name,
  label,
  description,
  ...inputProps
}: ISharedInputProps<T>) {
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

export interface ISharedTextareaProps<T extends z.ZodType>
  extends ISharedInputNoNameProps<T>,
    TextareaProps {
  name: Path<z.infer<T>>;
}
function FormTextarea<T extends z.ZodType>({
  control,
  name,
  label,
  description,
  ...textareaProps
}: ISharedTextareaProps<T>) {
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

interface INumPeriodInputs<T extends z.ZodType>
  extends ISharedInputNoNameProps<T> {
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
}: INumPeriodInputs<T>) {
  return (
    <div className="flex flex-1 items-start justify-evenly gap-4">
      <FormField
        control={control}
        name={numName}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel hidden>{label}</FormLabel>
            <Input
              placeholder="Number"
              type="number"
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
}: ISharedInputProps<T>) {
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
                  ? (field.value as Date).toISOString().slice(0, 16)
                  : ""
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

interface IBooleanSelectProps<T extends z.ZodType>
  extends ISharedInputProps<T> {
  placeholder?: "no" | "yes";
}
function BooleanSelect<T extends z.ZodType>({
  control,
  name,
  label,
  description,
  placeholder = "no",
}: IBooleanSelectProps<T>) {
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

export {
  FormInput,
  FormTextarea,
  NumPeriodInputs,
  DateTimeInput,
  BooleanSelect,
};
