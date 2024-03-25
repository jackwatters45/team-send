import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

// Auth
export interface Account {
  id: string;
  userId: string;
  type: string;
  password?: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  user: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// User
export interface IUserDetails {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email?: string;
  // emailVerified? : boolean;
  image: string;
}

export interface IUserConnections {
  nodeMailer?: string;
  twilio?: string;
}

export interface IUserMetaDetails {
  account: Account;
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserActivity {
  groups: string[];
  messagesSent: string[];
  messagesReceived: string[];
  messagesUpdated: string[];
}

export type User = IUserDetails &
  IUserConnections &
  IUserMetaDetails &
  IUserActivity;

export const authRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.user.findUnique({
      where: { id: userId },
    });
  }),

  getCurrentUserTemp: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { email: "jack.watters@me.com" },
    });
  }),
});
