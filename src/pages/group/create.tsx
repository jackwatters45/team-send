import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { api } from "@/utils/api";
import { createNewMember, extractInitials } from "@/lib/utils";
import { createGroupSchema } from "@/schemas/groupSchema";
import type {
	CreateGroupFormType,
	GroupConnectionsFormReturn,
	GroupMembersFormReturn,
} from "@/schemas/groupSchema";

import GroupMembersFormContent from "@/components/group/GroupMembersForm";
import { toast } from "@/components/ui/use-toast";
import PageLayout from "@/layouts/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput } from "@/components/ui/form-inputs";
import { Form, FormDescription } from "@/components/ui/form";
import {
	EmailConnection,
	GroupMeConnectionNewGroup as _,
	SMSConnections,
	SkeletonConnection,
} from "@/components/group/Connections";
import { CreateGroupAvatarUpload } from "@/components/ui/upload-input";
import { getServerAuthSession } from "@/server/auth";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

export default function CreateGroup() {
	const router = useRouter();
	const form = useForm<CreateGroupFormType>({
		resolver: zodResolver(createGroupSchema),
		defaultValues: {
			name: "",
			description: "",
			image: "",
			members: [createNewMember()],
			addedGroupIds: [],
			useSMS: false,
			changeGlobalSms: false,
			useEmail: false,
			changeGlobalEmail: false,
			useGroupMe: false,
			groupMeId: undefined,
		},
	});

	const { mutate } = api.group.create.useMutation({
		onSuccess: async (data) => {
			await router.push("/"); // TODO change
			toast({
				title: "Group Created",
				description: `Group "${data.name}" has been created.`,
			});
		},
		onError: (error) => {
			const errorMessage = error.data?.zodError?.fieldErrors?.content;
			toast({
				title: "Group Creation Failed",
				description:
					errorMessage?.[0] ??
					error.message ??
					"An error occurred while creating the group. Please try again.",
				variant: "destructive",
			});
		},
	});

	const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

	const onSubmit = form.handleSubmit((data) => {
		toast({
			title: "Creating Group",
			description: "Please wait while we create the group.",
		});

		data.image = imageUrl;

		mutate(data);
	});

	return (
		<PageLayout
			title={"Create New Group"}
			description={"Add members to your group and send them messages."}
		>
			<Form {...form}>
				<form onSubmit={onSubmit} className="flex w-full flex-col gap-16">
					<section className="flex flex-col-reverse items-center lg:flex-row lg:justify-between lg:gap-12">
						<div className="flex w-full  flex-col gap-8 px-4 py-4  sm:px-0 lg:max-w-lg">
							<CreateGroupAvatarUpload setImageURL={setImageUrl} />
							<FormInput<typeof createGroupSchema>
								control={form.control}
								name="name"
								label="Name"
								placeholder="Enter a Group Name"
								required={true}
								autoComplete="off"
							/>
							<FormInput<typeof createGroupSchema>
								control={form.control}
								name="description"
								label="Description"
								placeholder="Enter a Group Description (optional)"
							/>
						</div>
						{(form.watch("name") || imageUrl) && (
							<Avatar className="h-24 w-24 lg:h-48 lg:w-48">
								<AvatarImage src={imageUrl} alt="Group Avatar" />
								<AvatarFallback className="text-4xl font-medium lg:text-8xl">
									{extractInitials(form.watch("name"))}
								</AvatarFallback>
							</Avatar>
						)}
					</section>
					<Connections form={form as unknown as GroupConnectionsFormReturn} />
					<section className="flex flex-col gap-6">
						<GroupMembersFormContent
							title={"Add Members"}
							form={form as unknown as GroupMembersFormReturn}
							submitText={"Create Group"}
						/>
					</section>
				</form>
			</Form>
		</PageLayout>
	);
}

function Connections({ form }: { form: GroupConnectionsFormReturn }) {
	const { data, isLoading } = api.user.getIsUserConnections.useQuery();

	const isConnections = !!data?.smsConfig || !!data?.emailConfig; // TODO uncomment when add groups || !!data?.groupMeConfig;

	return (
		<section>
			<div className="rounded-md border p-4 dark:border-stone-800 dark:bg-stone-900/25">
				<h3 className=" text-lg font-medium tracking-tight ">Connections</h3>
				<FormDescription>
					Choose how you want to connect with members of this group. You will not be
					able to send messages when no connections are turned on.
				</FormDescription>
				{isLoading ? (
					<>
						<SkeletonConnection />
						<SkeletonConnection />
					</>
				) : (
					<>
						{!isConnections && (
							<div className="pt-5">
								<p className="text-sm font-medium text-red-500">
									You have no connections enabled. You can create groups but will not be
									able to send messages until you add connections.
								</p>
							</div>
						)}
						<div className="flex flex-col gap-5 pt-5">
							{!!data?.smsConfig && (
								<SMSConnections form={form as unknown as GroupConnectionsFormReturn} />
							)}
							{!!data?.emailConfig && (
								<EmailConnection form={form as unknown as GroupConnectionsFormReturn} />
							)}
							{/* {!!data.groupMeConfig && (
          <GroupMeConnectionNewGroup
          form={form as unknown as GroupConnectionsFormReturn}
          />
        )} */}
						</div>
					</>
				)}
			</div>
		</section>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const session = await getServerAuthSession(ctx);
	if (!session) {
		return {
			redirect: { destination: "/login", permanent: false },
		};
	}

	const helpers = genSSRHelpers(session);
	await helpers.user.getIsUserConnections.prefetch();

	return {
		props: {
			trpcState: helpers.dehydrate(),
		},
	};
}
