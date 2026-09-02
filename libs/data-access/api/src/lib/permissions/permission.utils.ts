export async function anyTrue(promises: (() => Promise<boolean>)[]) {
	for (const fn of promises) {
		if (await fn()) return true;
	}
	return false;
}
