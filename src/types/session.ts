import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    email?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      email?: string | null;
    };
  }
}
