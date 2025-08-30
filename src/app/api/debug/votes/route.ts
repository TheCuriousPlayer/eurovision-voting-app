export const GET = async () => {
	// Minimal debug route: return 204 No Content to avoid introducing any hardcoded data.
	return new Response(null, { status: 204 });
};
