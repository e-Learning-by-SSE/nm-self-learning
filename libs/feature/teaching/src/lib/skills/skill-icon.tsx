import { AcademicCapIcon as SkillLeafIcon } from "@heroicons/react/24/outline";
import {
	AcademicCapIcon as SkillGroupIcon,
	Squares2X2Icon as SkillRepositoryIcon
} from "@heroicons/react/24/solid";

export function SkillIcon({
	isRepository,
	isGroup = false,
	className = ""
}: {
	isRepository: boolean;
	isGroup?: boolean;
	className?: string;
}) {
	const Icon = isRepository ? SkillRepositoryIcon : isGroup ? SkillGroupIcon : SkillLeafIcon;
	return <Icon className={`icon h-5 text-lg ${className}`} />;
}
