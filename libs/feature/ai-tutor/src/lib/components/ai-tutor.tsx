import { useSession } from "next-auth/react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAiTutorContext } from "../context/ai-tutor-context";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import ReactMarkdown from "react-markdown";
import { IconOnlyButton } from "@self-learning/ui/common";
import { useTranslation } from "react-i18next";

export function AiTutor() {
	const {
		config,
		messages,
		input,
		loading,
		setInput,
		sendMessage,
		handleKeyDown,
		isTutorOpen,
		closeTutor,
		clearChat
	} = useAiTutorContext();

	const session = useSession();
	const user = session.data?.user;
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
	const { t } = useTranslation("ai-tutor");

	if (!config) return null;

	return (
		<div
			className={`fixed top-0 right-0 h-full w-2/6 z-20 transform transition-all duration-400 ease-out
              ${isTutorOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
		>
			<div className="h-full bg-white/20 backdrop-blur-xl border-l border-white/30 shadow-2xl">
				<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-blue-500/10"></div>
				<div className="relative h-full flex flex-col">
					<div className="p-3 pt-20 border-b border-white/20 bg-white/30">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10">
									<img
										className="rounded-xl object-cover object-top h-12"
										alt="Avatar"
										src={`${basePath}/avatar-female.png`}
										width={40}
									/>
								</div>
								<div>
									<h3 className="font-bold text-gray-900">{t("AI Tutor")}</h3>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
										<span className="text-xs text-gray-600">{t("Online")}</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<IconOnlyButton
									icon={
										<TrashIcon className="h-5 text-gray-700 hover:text-white" />
									}
									onClick={clearChat}
									title={t("Clear Chat")}
									className="hover:bg-red-500/90 rounded-xl"
								/>
								<IconOnlyButton
									icon={
										<XMarkIcon className="h-5 text-gray-700 hover:text-white" />
									}
									onClick={closeTutor}
									className="p-2 hover:bg-green-500/90 rounded-xl"
									title={t("Close Tutor")}
								/>
							</div>
						</div>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`flex items-start gap-3 max-w-sm ${msg.role === "user" ? "flex-row-reverse" : ""}`}
								>
									<div
										className={`w-8 h-8 min-w-8 rounded-xl flex items-center justify-center shadow-md ${
											msg.role === "user"
												? "bg-gradient-to-br from-gray-600 to-zinc-600"
												: "bg-gradient-to-br from-green-500 to-emerald-600"
										}`}
									>
										{msg.role === "user" ? (
											<img
												className="rounded-xl object-cover object-top w-10 h-9"
												alt="Avatar"
												src={
													user?.avatarUrl || `${basePath}/avatar-male.png`
												}
											/>
										) : (
											<img
												className="rounded-xl object-cover object-top w-10 h-9"
												alt="Avatar"
												src={`${basePath}/avatar-female.png`}
											/>
										)}
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
						<div className="justify-center">
							{loading && (
								<div className="flex items-start gap-3 max-w-xs">
									<div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-600">
										<img
											className="rounded-xl object-cover object-top w-10 h-9"
											alt="Avatar"
											src={`${basePath}/avatar-female.png`}
										/>
									</div>
									<div className="px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-lg bg-white/70 text-gray-800">
										{t("Thinking...")}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Input */}
					<div className="p-4 bg-white/10 border-t border-white/20">
						<div className="flex gap-3">
							<textarea
								value={input}
								onChange={e => {
									setInput(e.target.value);
									e.target.style.height = "auto";
									e.target.style.height = `${e.target.scrollHeight}px`;
								}}
								onKeyDown={handleKeyDown}
								disabled={loading}
								placeholder={t("Ask anything about the course...")}
								className="flex-1 px-4 py-3 bg-white/60 rounded-xl max-h-48 min-h-16"
							/>
							<button
								onClick={sendMessage}
								disabled={loading}
								className="btn btn-primary max-h-12 self-end"
							>
								{t("Send")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
