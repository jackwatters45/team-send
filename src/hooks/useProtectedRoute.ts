import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function useProtectedPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session.data) {
      void router.push("/login");
    }
  }, [session, router]);
}
