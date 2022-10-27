import { LightBulbIcon } from "@heroicons/react/outline";
import { CompiledMarkdown } from "@self-learning/markdown";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { motion } from "framer-motion";
import { MDXRemote } from "next-mdx-remote";

export function Hints({
	usedHints,
	useHint,
	totalHintsCount
}: {
	usedHints: CompiledMarkdown[];
	useHint: () => void;
	totalHintsCount: number;
}) {
	return (
		<>
			{usedHints.length > 0 && (
				<>
					<motion.h3
						className="text-2xl"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
					>
						Hinweise
					</motion.h3>

					<div className="flex flex-col gap-8">
						{usedHints.map((hint, index) => (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 1 }}
								key={index}
								className="relative flex max-w-full flex-col gap-4 rounded-lg border border-light-border bg-yellow-100 p-4"
							>
								<LightBulbIcon className="absolute right-2 top-2 h-6 text-yellow-500" />
								<MarkdownContainer>
									<MDXRemote {...hint} />
								</MarkdownContainer>
							</motion.div>
						))}
					</div>
				</>
			)}

			{usedHints.length < totalHintsCount && (
				<div className="grid items-start gap-4">
					<button
						className="flex place-content-center gap-4 rounded-lg border border-slate-200 px-3 py-2"
						onClick={useHint}
					>
						<LightBulbIcon className="h-6" />
						{usedHints.length === 0 && <span>Ich benötige einen Hinweis.</span>}
						{usedHints.length > 0 && usedHints.length < totalHintsCount && (
							<span>Ich benötige einen weiteren Hinweis.</span>
						)}
					</button>
					<span className="text-sm text-slate-400">
						Achtung: Das Verwenden von Hinweisen verringert die Anzahl der vergebenen
						Skill-Punkte.
					</span>
				</div>
			)}
		</>
	);
}
