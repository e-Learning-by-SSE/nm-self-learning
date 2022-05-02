import { useQuery } from "react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function fetchFromApi({ queryKey }: { queryKey: any }) {
	const response = await fetch(`${API_URL}/api/${queryKey.at(-1)}`);

	if (!response.ok) {
		throw { status: response.status, statusText: response.statusText };
	}

	return response.json();
}

export function useApi<ReturnType>(queryKey: string[]) {
	return useQuery<ReturnType>(queryKey, fetchFromApi, { staleTime: 5_000 });
}
