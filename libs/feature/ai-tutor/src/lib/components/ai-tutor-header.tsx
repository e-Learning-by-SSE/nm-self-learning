import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { IconOnlyButton } from "@self-learning/ui/common";
import { AiTutorHeaderProps } from "@self-learning/types";

export function AiTutorHeader({ onClose, onClear, t, basePath }: AiTutorHeaderProps) {
	return (
		<div className="p-3 pt-20 border-b border-white/20 bg-white/30">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10">
						<img
							className="rounded-xl object-cover object-top h-12"
							alt="AI Tutor Avatar"
							src={`${basePath}/avatar-female.png`}
							width={40}
						/>
					</div>
					<div>
						<h3 className="font-bold text-gray-900">{t("AI Tutor")}</h3>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
							<span className="text-xs text-gray-600">{t("Online")}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<IconOnlyButton
						icon={<TrashIcon className="h-5 text-gray-700 hover:text-white" />}
						onClick={onClear}
						title={t("Clear Chat")}
						className="hover:bg-red-500/90 rounded-xl"
					/>
					<IconOnlyButton
						icon={<XMarkIcon className="h-5 text-gray-700 hover:text-white" />}
						onClick={onClose}
						className="p-2 hover:bg-green-500/90 rounded-xl"
						title={t("Close Tutor")}
					/>
				</div>
			</div>
		</div>
	);
}
