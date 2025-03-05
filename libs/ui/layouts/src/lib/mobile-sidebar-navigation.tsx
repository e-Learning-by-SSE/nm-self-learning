import { ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function MobileSidebarNavigation({
	next,
	prev,
	content
}: {
	next: () => void;
	prev: () => void;
	content: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
  

	return (
		<>
			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white shadow-lg rounded-full flex justify-between items-center p-3 border border-gray-300">
				<button title="left-chevron" className="p-3 bg-gray-200 rounded-full"
				onClick={prev}>
					<ChevronLeftIcon className="h-6 w-6" />
				</button>

				<button
					title="menu"
					className="p-4 bg-secondary text-white rounded-full shadow-lg"
					onClick={() => setIsOpen(!isOpen)}
				>
					<ListBulletIcon className="h-6 w-6" />
				</button>

				<button title="right-chevron" className="p-3 bg-gray-200 rounded-full"
				onClick={next}>
					<ChevronRightIcon className="h-6 w-6" />
				</button>
			</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="fixed inset-0 bg-black/50 flex justify-center z-10 items-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsOpen(false)}
					>
						<motion.div
							className="bg-white w-[90%] h-[80%] p-6 rounded-xl shadow-xl overflow-auto"
							initial={{ y: 50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 50, opacity: 0 }}
							onClick={e => e.stopPropagation()}
						>
							{content}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
