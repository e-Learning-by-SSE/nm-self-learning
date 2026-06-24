import { AccessLevel, GroupRole } from "@prisma/client";
import Link from "next/link";
import { ReactNode } from "react";

type GroupRef = {
	id: number;
	name: string;
};

function getChipClassName(expired: boolean): string {
	const base = "rounded-full px-2 py-[2px] text-sm font-medium border";
	if (expired) {
		return `${base} bg-gray-200 text-gray-500 border-gray-300 line-through`;
	}
	return `${base} bg-green-100 text-green-700 border-green-300`;
}

export function GroupChipList({ children }: { children: ReactNode }) {
	return <span className="flex flex-wrap gap-2 text-xs">{children}</span>;
}

export function GroupMembershipChip({
	group,
	role,
	expiresAt
}: {
	group: GroupRef;
	role: GroupRole;
	expiresAt?: Date | string | null;
}) {
	const expired = !!expiresAt && new Date(expiresAt) < new Date();

	return (
		<Link href={`/teaching/groups/${group.id}`} className={getChipClassName(expired)}>
			{group.name} als {role}
		</Link>
	);
}

export function GroupPermissionChip({
	group,
	accessLevel
}: {
	group: GroupRef;
	accessLevel: AccessLevel;
}) {
	return (
		<Link href={`/teaching/groups/${group.id}`} className={getChipClassName(false)}>
			{group.name} ({accessLevel})
		</Link>
	);
}

export function ResourceGroupChips({
	permissions
}: {
	permissions: { accessLevel: AccessLevel; group: GroupRef }[];
}) {
	if (permissions.length === 0) {
		return null;
	}

	return (
		<GroupChipList>
			{permissions.map(permission => (
				<GroupPermissionChip
					key={permission.group.id}
					group={permission.group}
					accessLevel={permission.accessLevel}
				/>
			))}
		</GroupChipList>
	);
}
