import type { IUser } from "@/server/api/routers/user";

const createUser = (user?: IUser) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  notes: user?.notes ?? "",
});

export default createUser;
