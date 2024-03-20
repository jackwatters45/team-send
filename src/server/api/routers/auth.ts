import { createTRPCRouter, publicProcedure } from "../trpc";

// Auth
export interface Account {
  id: string;
  userId: string;
  type: string;
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
  avatar: string;
}

export interface IUserConnections {
  nodeMailer?: string;
  twilio?: string;
}

export interface IUserMetaDetails {
  accounts: Account[];
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
  getCurrentUser: publicProcedure.query(() => {
    return {
      id: "1",
      name: "Jack Watters",
      avatar: "https://randomuser.me/api/portraits",
      username: "jackwatters",
      email: "jack.watters@me.com",
      phone: "555-555-5555",
      nodeMailer: "111",
      twilio: "222",
    };
  }),
});
