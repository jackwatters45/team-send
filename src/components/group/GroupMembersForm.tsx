import { useForm } from "react-hook-form";
import { Suspense, lazy } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useDebounce } from "use-debounce";

import { createNewMember } from "@/lib/utils";
import type {
	GroupMembersFormReturn,
	groupMembersFormSchema,
} from "@/schemas/groupSchema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form-inputs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { RecentSearchResultsTablePlaceholder } from "./RecentResults";

const RecentContactsResults = lazy(() =>
	import("./RecentResults").then((m) => ({ default: m.RecentContactsResults })),
);

const RecentGroupResults = lazy(() =>
	import("./RecentResults").then((m) => ({ default: m.RecentGroupResults })),
);

interface GroupMembersFormProps extends GroupMemberHeaderProps {
	form: GroupMembersFormReturn;
	submitText: string;
}

export default function GroupMembersFormContent({
	form,
	title,
	submitText,
}: GroupMembersFormProps) {
	return (
		<>
			<GroupMemberHeader title={title} />
			<GroupMemberList form={form} />
			<GroupMembersRecents form={form} />
			<Button type="submit">{submitText}</Button>
		</>
	);
}

interface GroupMemberHeaderProps {
	title: string;
}
function GroupMemberHeader({ title }: GroupMemberHeaderProps) {
	// const csvRef = useRef<HTMLInputElement>(null);

	return (
		<div className="flex items-end justify-between border-b pb-1  text-xl font-semibold dark:border-stone-500 dark:border-opacity-20">
			<span>{title}</span>
			{/* <label htmlFor="csv-file-input" className="mb-1">
        <Button
          type="button"
          variant="secondary"
          size={"sm"}
          className="h-7"
          onClick={() => csvRef.current?.click()}
        >
          Upload CSV
        </Button>
        <input
          id="csv-file-input"
          type="file"
          className="hidden"
          accept=".csv"
          ref={csvRef}
        />
      </label> */}
		</div>
	);
}

function GroupMemberList({ form }: { form: GroupMembersFormReturn }) {
	const [parent] = useAutoAnimate();

	return (
		<div className="flex flex-col gap-2 py-2" ref={parent}>
			{form.watch("members")?.map((_, index) => (
				<div key={index} className="flex gap-2">
					<div className="flex flex-1 flex-wrap items-start gap-2">
						<FormField
							control={form.control}
							name={`members.${index}.isRecipient`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex h-10 cursor-pointer rounded-md border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-900">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												name={`members.${index}.isRecipient`}
											/>
										</FormControl>
									</FormLabel>
								</FormItem>
							)}
						/>
						<FormInput<typeof groupMembersFormSchema>
							control={form.control}
							name={`members.${index}.contact.name`}
							placeholder="Name"
						/>
						<FormInput<typeof groupMembersFormSchema>
							control={form.control}
							name={`members.${index}.contact.email`}
							type="email"
							required={false}
							placeholder="Email"
						/>
						<FormInput<typeof groupMembersFormSchema>
							control={form.control}
							name={`members.${index}.contact.phone`}
							type="tel"
							placeholder="Phone"
						/>
						<div className="lg:flex-1 ">
							<FormInput<typeof groupMembersFormSchema>
								control={form.control}
								name={`members.${index}.memberNotes`}
								placeholder="Notes"
							/>
						</div>
					</div>
					<FormItem>
						<Button
							variant="ghost"
							type="button"
							className="border hover:bg-stone-100
               dark:border-0 dark:hover:bg-stone-800"
							onClick={() => {
								form.setValue(
									"members",
									form.getValues("members").filter((_, i) => i !== index),
								);
							}}
						>
							<MinusCircledIcon className="h-5 w-5" />
						</Button>
					</FormItem>
				</div>
			))}
			<Button
				type="button"
				size={"sm"}
				className="flex w-fit items-center gap-2 pl-2"
				onClick={() => {
					form.setValue("members", [
						...form.getValues("members"),
						createNewMember(),
					]);
				}}
			>
				<PlusCircledIcon className="h-5 w-5" />
				Add New
			</Button>
		</div>
	);
}

function GroupMembersRecents({ form }: { form: GroupMembersFormReturn }) {
	const recentSearch = useForm({ defaultValues: { recentsSearch: "" } });

	const [search] = useDebounce(recentSearch.watch("recentsSearch"), 500);

	return (
		<Tabs
			defaultValue="contacts"
			className="border-t py-2 dark:border-stone-500 dark:border-opacity-20"
		>
			<div className="flex items-center justify-between">
				<span className="text-lg font-semibold">Recents</span>
				<TabsList className="grid w-full max-w-[300px] grid-cols-2">
					<TabsTrigger value="contacts">Contacts</TabsTrigger>
					<TabsTrigger value="groups">Groups</TabsTrigger>
				</TabsList>
			</div>
			<div className="pt-4">
				<FormInput
					control={recentSearch.control}
					name={"recentsSearch"}
					placeholder="Search for recent contacts or groups"
				/>
			</div>
			<div className="flex flex-col pt-2">
				<Suspense fallback={<RecentSearchResultsTablePlaceholder />}>
					<RecentContactsResults search={search} form={form} />
					<RecentGroupResults search={search} form={form} />
				</Suspense>
			</div>
		</Tabs>
	);
}
