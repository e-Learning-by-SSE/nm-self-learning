import { ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";



export function MobileSidebarNavigation({
	next,
	prev,
	content,
	hasNext,
	hasPrev
}: {
	next: () => void;
	prev: () => void;
	content: (onSelect: () => void) => React.ReactNode;
	hasNext?: boolean;
	hasPrev?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>("up");
	const lastScrollTop = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;

			setScrollDirection(scrollTop > lastScrollTop.current ? "down" : "up");
			lastScrollTop.current = scrollTop;
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<AnimatePresence>
				{scrollDirection === "up" && (
					<motion.div
						initial={{ y: 100, opacity: 0, x: "-50%" }}
						animate={{
							y: scrollDirection === "up" ? 0 : 100,
							opacity: scrollDirection === "up" ? 1 : 0,
							x: "-50%"
						}}
						exit={{ y: 100, opacity: 0, x: "-50%" }}
						transition={{
							type: "spring"
						}}
						className="fixed bottom-10 left-1/2 -translate-x-1/2  w-[90%] max-w-md bg-white shadow-lg rounded-full flex justify-between items-center p-3 z-50 border border-gray-300"
					>
						<button
							title="left-chevron"
							className="p-3 bg-gray-200 rounded-full disabled:invisible"
							onClick={prev}
							disabled={!(hasPrev ?? true)}
						>
							<ChevronLeftIcon className="h-6 w-6" />
						</button>

						<button
							title="menu"
							className="p-4 bg-secondary text-white rounded-full shadow-lg"
							onClick={() => setIsOpen(!isOpen)}
						>
							<ListBulletIcon className="h-6 w-6" />
						</button>

						<button
							title="right-chevron"
							className="p-3 bg-gray-200 rounded-full disabled:invisible"
							onClick={next}
							disabled={!(hasNext ?? true)}
						>
							<ChevronRightIcon className="h-6 w-6" />
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="fixed inset-0 bg-black/50 flex justify-center z-50 items-center touch-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsOpen(false)}
					>
						<motion.div
							className="bg-white w-[95%] h-[95%] p-6 rounded-xl shadow-xl overflow-y-auto"
							initial={{ y: 50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 50, opacity: 0 }}
							onClick={e => e.stopPropagation()}
						>
								{content(() => {
									setIsOpen(false);
								})}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
