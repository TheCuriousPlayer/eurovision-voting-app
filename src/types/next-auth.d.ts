import 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in `User` model from `next-auth`.
   */
  interface User {
    id: string;
  }

  /**
   * Extends the built-in `Session` model from `next-auth`.
   */
  interface Session {
    user: User;
  }
}
