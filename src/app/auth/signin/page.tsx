'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1>Welcome, {session.user?.name}</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 mt-4 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl mb-4">Eurovision Turkiye Voting</h1>
      <button
        onClick={() => signIn("google")}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Sign In with Google
      </button>
    </div>
  );
}
