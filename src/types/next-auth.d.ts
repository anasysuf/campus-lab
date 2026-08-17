import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'STUDENT' | string;
      nim?: string | null;
      department?: string | null;
      phone?: string | null;
      avatar?: string | null;
      ktmImage?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'ADMIN' | 'STUDENT' | string;
    nim?: string | null;
    department?: string | null;
    phone?: string | null;
    avatar?: string | null;
    ktmImage?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'STUDENT' | string;
    nim?: string | null;
    department?: string | null;
    phone?: string | null;
    avatar?: string | null;
    ktmImage?: string | null;
  }
}
