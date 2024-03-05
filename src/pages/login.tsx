import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import AlternateLogins from "@/components/login/AlternateLogins";
import LocalLogin from "@/components/login/LocalLogin";

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-100">
      <Card className="w-[min(90vw,400px)] rounded-lg bg-white shadow-2xl">
        <CardHeader>
          <CardTitle>SMS Reminders</CardTitle>
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
