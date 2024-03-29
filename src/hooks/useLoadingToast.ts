import { type Toast, toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export default function useLoadingToast({
  isLoading,
  toastOptions,
}: {
  isLoading: boolean;
  toastOptions: Toast;
}) {
  const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>();
  useEffect(() => {
    if (isLoading && !loadingToast) {
      setLoadingToast(toast(toastOptions));
    } else if (loadingToast && !isLoading) {
      loadingToast.dismiss();
      setLoadingToast(undefined);
    }

    return () => {
      if (loadingToast) {
        loadingToast.dismiss();
        setLoadingToast(undefined);
      }
    };
  }, [loadingToast, isLoading, toastOptions]);
}
