import { NextResponse } from 'next/server';

// Explicit exported handler to ensure this file is treated as a module by Next.js
export const GET = async (): Promise<NextResponse> => {
  const data = {
    message: 'No hardcoded data available',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(data);
};
