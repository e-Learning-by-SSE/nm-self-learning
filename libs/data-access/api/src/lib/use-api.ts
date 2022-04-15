import { useQuery } from "react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function fetchFromApi({ queryKey }: { queryKey: unknown }) {
	console.log(`${API_URL}/api/${queryKey}`);
	const response = await fetch(`${API_URL}/api/${queryKey}`);

	if (!response.ok) {
		throw { status: response.status, statusText: response.statusText };
	}

	return response.json();
}

export function useApi<ReturnType>(url: string) {
	return useQuery<ReturnType>(url, fetchFromApi);
}
