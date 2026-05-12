import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('WARNING: NEXTAUTH_SECRET is not set. Sessions may be insecure.');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 2, // 2 hours
    updateAge: 60 * 30 // 30 minutes
  },
  // Explicit cookie options to enforce secure, httpOnly and SameSite in production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
};

// Helper function to check if a user is an admin
export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) ?? [];
  return adminEmails.includes(email.trim().toLowerCase());
};

// Helper to check if a user is a GM (game master). This reads the
// `GM_EMAILS_DEFAULT` environment variable and also treats any email
// in `ADMIN_EMAILS` as a GM (admins implicitly have GM privileges).
export const getIsGMCheckData = (email: string | null | undefined) => {
  const gmEmails = process.env.GM_EMAILS_DEFAULT?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) ?? [];
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) ?? [];
  const normalized = email?.trim().toLowerCase() ?? '';
  return { gmEmails, adminEmails, normalized };
};

export const getIsGMCheckMessage = (email: string | null | undefined): string => {
  const { gmEmails, adminEmails, normalized } = getIsGMCheckData(email);
  return `isGM check:\n` +
    `gmEmails=${gmEmails.join(', ')}\n` +
    `adminEmails=${adminEmails.join(', ')}\n` +
    `normalized=${normalized}`;
};

export const isGM = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const { gmEmails, adminEmails, normalized } = getIsGMCheckData(email);
  return gmEmails.includes(normalized) || adminEmails.includes(normalized);
};

