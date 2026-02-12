import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { AiTutorMessagesProps } from "@self-learning/types";

export function AiTutorMessages({ messages, isLoading, user, basePath, t }: AiTutorMessagesProps) {
	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.map((msg, idx) => (
				<div
					key={idx}
					className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
				>
					<div
						className={`flex items-start gap-3 max-w-sm ${
							msg.role === "user" ? "flex-row-reverse" : ""
						}`}
					>
						<div
							className={`w-8 h-8 min-w-8 rounded-xl flex items-center justify-center shadow-md ${
								msg.role === "user"
									? "bg-gradient-to-br from-gray-600 to-zinc-600"
									: "bg-gradient-to-br from-green-500 to-emerald-600"
							}`}
						>
							<img
								className="rounded-xl object-cover object-top w-10 h-9"
								alt="Avatar"
								src={
									msg.role === "user"
										? user?.avatarUrl || `${basePath}/avatar-male.png`
										: `${basePath}/avatar-female.png`
								}
							/>
						</div>

						<div
							className={`px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-lg ${
								msg.role === "user"
									? "bg-gray-400 text-white"
									: "bg-white/70 text-gray-800"
							}`}
						>
							<ReactMarkdown
								remarkPlugins={remarkPlugins}
								rehypePlugins={rehypePlugins}
							>
								{msg.content}
							</ReactMarkdown>
						</div>
					</div>
				</div>
			))}

			{isLoading && (
				<div className="flex justify-start">
					<div className="flex items-start gap-3 max-w-xs">
						<div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-600">
							<img
								className="rounded-xl object-cover object-top w-10 h-9"
								alt="AI Tutor"
								src={`${basePath}/avatar-female.png`}
							/>
						</div>
						<div className="px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-lg bg-white/70 text-gray-800">
							{t("Thinking...")}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
