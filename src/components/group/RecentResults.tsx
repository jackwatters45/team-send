import { parsePhoneNumber } from "libphonenumber-js";
import type { Contact } from "@prisma/client";
import type { NewContact } from "@/server/api/routers/contact";
import { createNewMember, extractInitials } from "@/lib/utils";
import { api } from "@/utils/api";
import type {
	GroupMembersFormReturn,
	GroupMembersFormType,
} from "@/schemas/groupSchema";
import { TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

interface RecentResultsProps {
	search: string;
	form: GroupMembersFormReturn;
}

export function RecentContactsResults({ search, form }: RecentResultsProps) {
	const addedContactIds = form
		.getValues("members")
		.reduce((accumulator, member) => {
			if (member.contact.id) {
				accumulator.push(member.contact.id);
			}
			return accumulator;
		}, [] as string[]);

	const { data } = api.contact.getRecentContacts.useQuery({
		search,
		addedContactIds,
	});

	const results = useSearchResults(data);

	const handleClickContact = (contact: NewContact) => {
		form.setValue("members", [
			...form.getValues("members"),
			createNewMember({ contact }),
		]);
	};

	return (
		<TabsContent value="contacts">
			<div className="flex flex-wrap">
				{results?.length ? (
					results.map((contact) => {
						const phoneNumber = contact?.phone
							? parsePhoneNumber(contact.phone)
							: null;
						return (
							<Button
								key={contact?.id}
								onClick={() => handleClickContact(contact)}
								type="button"
								variant={"ghost"}
								className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2 dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
							>
								<Avatar className="h-10 w-10">
									<AvatarFallback className="">
										{extractInitials(contact.name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start truncate">
									<div>{contact.name}</div>
									<div className="flex text-sm text-stone-500 ">
										{contact.email && <div>{contact.email}</div>}
										{phoneNumber && contact.email && <div className="mx-1">•</div>}
										{phoneNumber && <div>{phoneNumber.formatNational()}</div>}
									</div>
								</div>
							</Button>
						);
					})
				) : results ? (
					<div>No contacts named &quot;{search}&quot;</div>
				) : (
					Array.from({ length: 10 }).map((_, index) => (
						<RecentSearchResultPlaceholder key={index} />
					))
				)}
			</div>
		</TabsContent>
	);
}

export function RecentGroupResults({ search, form }: RecentResultsProps) {
	const { data } = api.group.getRecentGroups.useQuery({
		search,
		addedGroupIds: form.getValues("addedGroupIds"),
	});

	const results = useSearchResults(data);

	const handleClickGroup = (
		id: string,
		groupMembers: Array<{ contact: Contact }>,
	) => {
		form.setValue("addedGroupIds", [...form.getValues("addedGroupIds"), id]);

		const members = form.getValues("members");
		const filteredGroupMemberIds = groupMembers.reduce(
			(accumulator, { contact }) => {
				if (!members.some((m) => m.contact.id === contact.id)) {
					accumulator.push({ isRecipient: true, contact, memberNotes: "" });
				}
				return accumulator;
			},
			[] as GroupMembersFormType["members"],
		);

		form.setValue("members", [...members, ...filteredGroupMemberIds]);
	};

	return (
		<TabsContent value="groups">
			<div className="flex flex-wrap">
				{results?.length ? (
					results.map((group) => (
						<Button
							key={group?.id}
							onClick={() => handleClickGroup(group.id, group.members)}
							type="button"
							variant={"ghost"}
							className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2
      dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
						>
							<Avatar className="h-10 w-10">
								<AvatarImage src={group.image ?? undefined} alt="Contact Avatar" />
								<AvatarFallback className="">
									{extractInitials(group.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col items-start truncate">
								<div>{group.name}</div>
								{group.description && (
									<div className="text-sm text-stone-500">
										{group.description.slice(0, 60)}
									</div>
								)}
							</div>
						</Button>
					))
				) : results ? (
					<div>No groups named &quot;{search}&quot;</div>
				) : (
					Array.from({ length: 10 }).map((_, index) => (
						<RecentSearchResultPlaceholder key={index} />
					))
				)}
			</div>
		</TabsContent>
	);
}

function useSearchResults<T>(data: T) {
	const [results, setResults] = useState<T | undefined>(undefined);

	useEffect(() => {
		if (data) setResults(data);
	}, [data]);

	return results;
}

function RecentSearchResultPlaceholder() {
	return (
		<Skeleton className="flex h-14 w-full items-center gap-2 border border-stone-200 bg-white p-2 lg:w-1/2 dark:border-transparent dark:bg-transparent">
			<Skeleton className="h-10 w-10 rounded-full" />
			<div className="flex h-10 w-full flex-col items-start gap-1 truncate">
				<Skeleton className="h-5  w-1/2" />
				<Skeleton className="h-4 w-4/5" />
			</div>
		</Skeleton>
	);
}

export function RecentSearchResultsTablePlaceholder() {
	return Array.from({ length: 10 }).map((_, index) => (
		<RecentSearchResultPlaceholder key={index} />
	));
}
