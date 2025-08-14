import { useSession } from "next-auth/react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAiTutorContext } from "../context/ai-tutor-context";

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
								<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
									<div className="text-white">AI</div>
								</div>
								<div>
									<h3 className="font-bold text-gray-900">AI Tutor</h3>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
										<span className="text-xs text-gray-600">Online</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<button
									onClick={clearChat}
									className="p-2 hover:bg-red-500/90 rounded-xl"
									title="Clear Chat"
								>
									<TrashIcon className="w-5 h-5 text-gray-700 hover:text-white" />
								</button>
								<button
									onClick={closeTutor}
									className="p-2 hover:bg-green-500/90 rounded-xl"
									title="Close Tutor"
								>
									<XMarkIcon className="w-5 h-5 text-gray-700 hover:text-white" />
								</button>
							</div>
						</div>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`flex items-start gap-3 max-w-sm ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
								>
									<div
										className={`w-8 h-8 min-w-8 rounded-xl flex items-center justify-center shadow-md ${
											msg.sender === "user"
												? "bg-gradient-to-br from-gray-600 to-zinc-600"
												: "bg-gradient-to-br from-green-500 to-emerald-600"
										}`}
									>
										{msg.sender === "user" ? (
											<div>
												{user?.image ? (
													<img
														className="rounded-full object-cover object-top"
														alt="Avatar"
														src={user.image}
														width={42}
														height={42}
													/>
												) : (
													<div className=" bg-gray-100"></div>
												)}
											</div>
										) : (
											<div className="text-white">AI</div>
										)}
									</div>
									<div
										className={`px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-lg ${
											msg.sender === "user"
												? "bg-gray-400 text-white"
												: "bg-white/70 text-gray-800"
										}`}
									>
										{msg.content}
									</div>
								</div>
							</div>
						))}
						<div className="justify-center">
							{loading && (
								<div className="flex items-start gap-3 max-w-xs">
									<div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-green-500 to-emerald-600">
										<div className="text-white">AI</div>
									</div>
									<div className="px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-lg bg-white/70 text-gray-800">
										Thinking...
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
								placeholder="Ask anything about the course..."
								className="flex-1 px-4 py-3 bg-white/60 rounded-xl max-h-48 min-h-16"
							/>
							<button
								onClick={sendMessage}
								disabled={loading}
								className="btn btn-primary max-h-12 self-end"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
