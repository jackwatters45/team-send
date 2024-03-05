import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import AlternateLogins from "@/components/login/AlternateLogins";
import LocalLogin from "@/components/login/LocalLogin";
import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  return (
    <div
      className="flex h-screen items-center justify-center bg-neutral-100
    bg-stone-950"
    >
      <Card className="w-[min(90vw,400px)] rounded-lg bg-white shadow-2xl">
        <CardHeader>
          <CardTitle>Team Send</CardTitle>
          <CardDescription>
            Easily send targeted bulk SMS to groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocalLogin />
          <AlternateLogins />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

function AuthShowcase() {
  const { data: sessionData } = useSession();

  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user !== undefined },
  // );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
