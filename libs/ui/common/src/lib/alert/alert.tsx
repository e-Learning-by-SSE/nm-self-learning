import { motion } from "framer-motion";
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	InformationCircleIcon
} from "@heroicons/react/24/outline";
import { ShieldExclamationIcon } from "@heroicons/react/24/solid";

export type warningType = {
	severity: "WARNING" | "ERROR" | "INFORMATION" | "SUCCESS";
	message: React.ReactNode;
};

export function Alert({ type }: { type: warningType }) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: "tween", duration: 0.5 }}
			className={`flex flex-col gap-2 rounded-lg border p-4 ${
				type.severity === "WARNING"
					? "border-yellow-500 bg-yellow-100 text-yellow-500"
					: type.severity === "ERROR"
						? "border-c-danger bg-c-danger-subtle text-c-danger"
						: type.severity === "INFORMATION"
							? "border-blue-500 bg-blue-100 text-blue-500"
							: "border-green-500 bg-green-100 text-green-500"
			}`}
		>
			<div className="flex flex-row gap-2">
				{type.severity === "WARNING" ? (
					<ExclamationCircleIcon className="icon h-5 text-lg" />
				) : type.severity === "ERROR" ? (
					<ShieldExclamationIcon className="icon h-5 text-lg" />
				) : type.severity === "INFORMATION" ? (
					<InformationCircleIcon className="icon h-5 text-lg" />
				) : (
					<CheckCircleIcon className="icon h-5 text-lg" />
				)}
				<span className="font-medium">{type.message}</span>
			</div>
		</motion.div>
	);
}
