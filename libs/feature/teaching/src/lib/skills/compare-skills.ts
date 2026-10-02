export function compareSkills(
	left: { numberChildren: number; name: string },
	right: { numberChildren: number; name: string }
) {
	return right.numberChildren - left.numberChildren || left.name.localeCompare(right.name);
}
