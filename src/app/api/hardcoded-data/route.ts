import { NextResponse } from 'next/server';

// Minimal GET handler so this file is recognized as a module by Next.js/TypeScript
export async function GET() {
	const data = {
		message: 'No hardcoded data available',
		timestamp: new Date().toISOString(),
	};

	return NextResponse.json(data);
}
