export async function apiFetch<TResult, TInput>(
	method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE",
	url: string,
	body?: TInput
): Promise<TResult> {
	const response = await fetch(url, {
		method,
		headers: body
			? {
					"content-type": "application/json"
				}
			: undefined,
		body: body ? JSON.stringify(body) : undefined
	});

	const json = await response.json();

	if (!response.ok) {
		console.error(json);
		throw json;
	}

	return json as TResult;
}
