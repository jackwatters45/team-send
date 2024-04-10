import { useRouter } from "next/router";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { TRPCClientError } from "@trpc/client";

import { env } from "@/env";
import { db } from "@/server/db";
import { type RouterOutputs, api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getServerAuthSession } from "@/server/auth";

import { SettingActionItem } from "@/components/ui/setting-action-item";
import { AccountLayout } from "@/layouts/AccountLayout";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";
import { toast } from "@/components/ui/use-toast";
import { Form, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form-inputs";
import { Button } from "@/components/ui/button";
import { type SMSFormType, smsFormSchema } from "@/lib/schemas/smsSchema";

export default function AccountSettings({
  emailConfig,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: user, error } = api.auth.getCurrentUser.useQuery();

  useEffect(() => {
    if (emailConfig === "success") {
      toast({
        title: "Email connected",
        description: "You can now send messages via email.",
      });
    } else if (emailConfig === "error") {
      toast({
        title: "Error connecting email",
        description:
          "There was an error connecting email to your account. Please try again.",
      });
    }
  }, [emailConfig]);

  if (!user) return renderErrorComponent(error);

  return (
    <AccountLayout
      title="User Settings"
      description={"View and edit your settings."}
    >
      <div
        className=" flex flex-col pt-3
        dark:border-stone-500 dark:border-opacity-20"
      >
        <h2 className="text-xl font-semibold tracking-tight">
          Edit Account Settings
        </h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          Make changes to account settings here.
        </div>
      </div>
      <section className="pt-6">
        <div className="rounded-md bg-stone-100 px-6 py-2 shadow drop-shadow dark:bg-stone-900/50">
          <div className="flex flex-col pb-4 pt-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Connections
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Manage your communication methods.
            </p>
          </div>
          <div className="flex flex-col gap-8 py-4 sm:gap-6">
            <ConnectSMS user={user} />
            <ConnectEmail user={user} />
            <ConnectGroupMe user={user} />
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="rounded-md bg-stone-100 px-6 py-2 shadow drop-shadow dark:bg-stone-900/50">
          <div className="flex flex-col pb-4 pt-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Account Actions
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Manage your account settings.
            </p>
          </div>
          <div className="flex flex-col gap-8 py-4 sm:gap-6">
            <ExportAccountData user={user} />
            {/* <ArchiveAccount /> */}
            <DeleteAccount />
          </div>
        </div>
      </section>
    </AccountLayout>
  );
}

type SettingsUser = RouterOutputs["auth"]["getCurrentUser"];

function ConnectEmail({ user }: { user: SettingsUser }) {
  const router = useRouter();

  const ctx = api.useUtils();
  const { mutate: connectEmail } = api.auth.connectEmail.useMutation({
    onSuccess: async (data) => {
      await router.push(data);
    },
    onError: () => {
      toast({
        title: "Error connecting email",
        description:
          "There was an error connecting email to your account. Please try again.",
      });
    },
  });
  const handleClickConnectEmail = () => connectEmail();

  const { mutate: disconnectEmail } = api.auth.disconnectEmail.useMutation({
    onSuccess: async () => {
      await ctx.auth.getCurrentUser.invalidate();
      toast({
        title: "Email disconnected",
        description: "You can no longer send messages via email.",
      });
    },
    onError: () => {
      toast({
        title: "Error disconnecting connecting email",
        description:
          "There was an error disconnecting your email from your account. Please try again.",
      });
    },
  });
  const handleClickDisconnectEmail = () => disconnectEmail();

  return !user?.emailConfig ? (
    <SettingActionItem
      title="Email"
      description={"Send emails via Nodemailer to members of this group."}
      actionButtonText={"Connect"}
      buttonVariant={"default"}
      onAction={handleClickConnectEmail}
    />
  ) : (
    <SettingActionItem
      title="Email"
      description={`Connected via Nodemailer: ${user?.emailConfig.email}.`}
      actionButtonText={"Disconnect"}
      buttonVariant={"destructive"}
      onAction={handleClickDisconnectEmail}
    />
  );
}

function ConnectSMS({ user }: { user: SettingsUser }) {
  const ctx = api.useUtils();

  const { mutate: connectSMSDefault } = api.auth.connectSmsDefault.useMutation({
    onSuccess: async () => {
      setIsConnectingSMS(false);
      await ctx.auth.getCurrentUser.invalidate();
    },
    onError: () => {
      toast({
        title: "Error connecting connecting sms",
        description:
          "There was an error connecting sms to your account. Please try again.",
      });
    },
  });
  const handleClickConnectSMSDefault = () => connectSMSDefault();

  const [isConnectingSMS, setIsConnectingSMS] = useState(false);
  const handleClickConnectSMS = () => setIsConnectingSMS((prev) => !prev);

  const form = useForm<SMSFormType>({
    resolver: zodResolver(smsFormSchema),
    defaultValues: {
      accountSid: "",
      authToken: "",
      phoneNumber: "",
    },
  });

  const { mutate: connectSMS } = api.auth.connectSms.useMutation({
    onSuccess: async () => {
      setIsConnectingSMS(false);
      await ctx.auth.getCurrentUser.invalidate();
    },
    onError: () => {
      toast({
        title: "Error connecting connecting sms",
        description:
          "There was an error connecting sms to your account. Please try again.",
      });
    },
  });
  const onSubmit = async (data: SMSFormType) => connectSMS(data);

  const { mutate: disconnectSMS } = api.auth.disconnectSms.useMutation({
    onSuccess: async () => {
      await ctx.auth.getCurrentUser.invalidate();
      toast({
        title: "SMS disconnected",
        description: "You can no longer send messages via sms.",
      });
    },
    onError: () => {
      toast({
        title: "Error disconnecting connecting sms",
        description:
          "There was an error disconnecting your sms from your account. Please try again.",
      });
    },
  });
  const handleClickDisconnectSMS = () => disconnectSMS();

  return !user?.smsConfig ? (
    <SettingActionItem
      title="SMS"
      description={
        <div>
          <span>Send sms via Twilio to members of this group.</span>
          <Button
            variant={"link"}
            className="h-fit px-1 py-0"
            onClick={handleClickConnectSMS}
          >
            Connect
          </Button>
          <span>your own twilio account.</span>
        </div>
      }
      actionButtonText={"Connect"}
      buttonVariant={"default"}
      onAction={handleClickConnectSMSDefault}
      hideButton={isConnectingSMS}
    >
      {isConnectingSMS && (
        <div className="pt-4">
          <div className="border-t border-stone-300 pt-3 dark:border-stone-800">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <FormDescription>
                    Your SMS Account Info can be found in your Twilio dashboard.
                    Make sure to register your number as an A2P 10DLC number.
                  </FormDescription>
                  <FormInput
                    name="accountSid"
                    label="Twilio SID"
                    control={form.control}
                    placeholder="AC••••••••••••••••••"
                  />
                  <FormInput
                    name="authToken"
                    label="Twilio Auth Token"
                    control={form.control}
                    placeholder="••••••••••••••••••••"
                  />
                  <FormInput
                    name="phoneNumber"
                    label="Twilio Phone Number"
                    control={form.control}
                    placeholder="+1••••••••••"
                    type="tel"
                  />
                  <div className="pt-2">
                    <Button type="submit" className="w-full ">
                      {form.formState.isSubmitting
                        ? "Connecting..."
                        : "Connect"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </SettingActionItem>
  ) : (
    <SettingActionItem
      title="SMS"
      description={
        user.smsConfig.isDefault
          ? `Connected to default Twilio number: ${user?.smsConfig.phoneNumber}.`
          : `Connected to custom Twilio number: ${user?.smsConfig.phoneNumber}.`
      }
      actionButtonText={"Disconnect"}
      buttonVariant={"destructive"}
      onAction={handleClickDisconnectSMS}
    />
  );
}

function ConnectGroupMe({ user }: { user: SettingsUser }) {
  const router = useRouter();

  const handleClickConnectGroupMe = () => {
    void router.push(env.NEXT_PUBLIC_GROUPME_REDIRECT_URI);
  };

  const ctx = api.useUtils();
  const { mutate: disconnectGroupMe } = api.auth.disconnectGroupMe.useMutation({
    onSuccess: async () => {
      await ctx.auth.getCurrentUser.invalidate();
      toast({
        title: "GroupMe disconnected",
        description: "You can no longer send messages via GroupMe.",
      });
    },
    onError: () => {
      toast({
        title: "Error disconnecting GroupMe",
        description:
          "There was an error disconnecting GroupMe from your account. Please try again.",
      });
    },
  });
  const handleClickDisconnectGroupMe = () => disconnectGroupMe();

  return !user?.groupMeConfig ? (
    <SettingActionItem
      title="GroupMe"
      description={"Send GroupMe messages to members of this group."}
      actionButtonText={"Connect"}
      buttonVariant={"default"}
      onAction={handleClickConnectGroupMe}
    />
  ) : (
    <SettingActionItem
      title="GroupMe"
      description={`Connected to GroupMe: ${user?.groupMeConfig.id}.`}
      actionButtonText={"Disconnect"}
      buttonVariant={"destructive"}
      onAction={handleClickDisconnectGroupMe}
    />
  );
}

function ExportAccountData({ user }: { user: SettingsUser }) {
  const { refetch } = api.auth.getExportData.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    const res = await refetch();

    if (!res.data) {
      toast({
        title: "Error exporting data",
        description:
          "There was an error exporting your data. Please try again.",
      });
      return;
    }

    const exportData = res.data;

    const blob = new Blob([exportData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user?.id}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been successfully exported.",
    });
  };

  return (
    <SettingActionItem
      title="Export Your Data"
      description="Download a file containing your account information for safekeeping."
      actionButtonText="Export Data"
      onAction={handleExport}
    />
  );
}

// TODO
function _ArchiveAccount() {
  const router = useRouter();
  const { mutate: archiveAccount } = api.auth.archiveAccount.useMutation({
    onSuccess: async () => {
      await router.push("/login");
      toast({
        title: "Account archived",
        description: "Your account has been successfully archived.",
      });
    },
    onError: () => {
      toast({
        title: "Error archiving account",
        description:
          "There was an error archiving your account. Please try again.",
      });
    },
  });
  const handleArchiveAccount = () => archiveAccount();

  return (
    <SettingActionItem
      title="Archive your account"
      description="Your account can be restored at any time after it's been archived."
      actionButtonText="Archive Account"
      buttonVariant="destructive"
      onAction={handleArchiveAccount}
    />
  );
}

function DeleteAccount() {
  const router = useRouter();
  const { mutate: deleteAccount } = api.auth.deleteAccount.useMutation({
    onSuccess: async () => {
      await router.push("/login");
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting account",
        description:
          "There was an error deleting your account. Please try again.",
      });
    },
  });
  const handleDeleteAccount = () => deleteAccount();

  return (
    <SettingActionItem
      title="Delete your account"
      description="Once you delete your account, there is no going back. Please be certain."
      actionButtonText="Delete Account"
      buttonVariant="destructive"
      onAction={handleDeleteAccount}
    />
  );
}

type GetServerSidePropsReturn = {
  emailConfig: "success" | "error" | null;
};
export const getServerSideProps: GetServerSideProps<
  GetServerSidePropsReturn
> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  let emailConfig: "success" | "error" | null = null;
  const { scope, code } = ctx.query as { scope?: string; code?: string };
  if (code && scope?.includes("google")) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailConfig: true },
    });

    if (!user?.emailConfig) {
      emailConfig = await exchangeAuthCodeForTokens(session, code);
    }
  }

  // GroupMe config redirect
  const { access_token } = ctx.query as { access_token?: string };
  if (access_token) {
    await db.groupMeConfig.upsert({
      where: { userId: session.user.id },
      update: { accessToken: access_token },
      create: {
        accessToken: access_token,
        user: { connect: { id: session.user.id } },
      },
    });

    return {
      redirect: { destination: "/account/settings", permanent: false },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.auth.getCurrentUser.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
      emailConfig,
    },
  };
};

async function exchangeAuthCodeForTokens(session: Session, authCode: string) {
  const params = new URLSearchParams();
  params.append("code", authCode);
  params.append("client_id", env.GOOGLE_ID_DEV);
  params.append("client_secret", env.GOOGLE_SECRET_DEV);
  params.append("redirect_uri", "http://localhost:3000/account/settings");
  params.append("grant_type", "authorization_code");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) return "error";

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    error?: string;
  };

  if (data.access_token) {
    const email = await fetchGoogleUserEmail(data.access_token);
    await db.emailConfig.create({
      data: {
        userId: session.user.id,
        email: email,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      },
    });
    return "success";
  } else {
    console.error("Error exchanging code for tokens:", data.error);
    return "error";
  }
}

async function fetchGoogleUserEmail(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new TRPCClientError("Failed to fetch user information");
  }

  const data = (await response.json()) as { email: string };
  return data.email;
}
