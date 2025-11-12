import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { PauseCircleIcon } from "@heroicons/react/24/outline";
import { AnimatedFlame } from "@self-learning/ui/common";

export function StreakIndicatorCircle({
	count,
	status,
	onClick
}: {
	count: number;
	status: "active" | "paused" | "broken";
	onClick?: () => void;
}) {
	const StatusIcon = getStatusIcon(status);
	const flameSize = getStreakBasedFlameSize(count);
	return (
		<div
			className="relative w-full h-full hover:scale-110 transition-transform cursor-pointer group"
			onClick={onClick}
		>
			{/* Flame container, bigger than the circle with the streak */}
			<div className={`absolute ${flameSize}`}>
				<AnimatedFlame className="w-full h-full">
					<div className="absolute inset-0 bg-transparent"></div>
				</AnimatedFlame>
			</div>
			{/* Circle with streak cound */}
			<div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-200 via-yellow-100 to-white text-orange-600 text-xl font-extrabold shadow-[0_0_20px_rgba(255,180,100,0.6)] backdrop-blur-sm">
				{count} {StatusIcon && <StatusIcon className="w-4 h-4 ml-2" />}
			</div>
		</div>
	);
}

function getStatusIcon(status: "active" | "paused" | "broken") {
	switch (status) {
		case "active":
			return null; // No icon for active status
		case "paused":
			return PauseCircleIcon;
		case "broken":
			return ExclamationTriangleIcon;
	}
}

function getStreakBasedFlameSize(streakCount: number) {
	if (streakCount >= 100) {
		return "-inset-16 scale-125 -translate-y-6";
	} else if (streakCount >= 50) {
		return "-inset-16 scale-75 -translate-y-4";
	} else if (streakCount >= 10) {
		return "-inset-8 scale-75";
	} else if (streakCount >= 5) {
		return "-inset-8 scale-50";
	} else {
		// only show the flame on hover
		return "-inset-8 scale-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700";
	}
}
