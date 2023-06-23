import Link from "next/link";

export function Footer() {
	return (
		<footer className="relative z-20 border-t border-t-gray-200 bg-white py-4">
			<div className="container mx-auto px-4">
				<div className="flex justify-between">
					<div>
						<Link
							href="https://www.uni-hildesheim.de/impressum/"
							target="_blank"
							className="text-sm font-medium hover:text-secondary"
						>
							Impressum
						</Link>
					</div>
					<div>
						<Link
							href="https://www.uni-hildesheim.de/datenschutz/"
							target="_blank"
							className="text-sm font-medium hover:text-secondary"
						>
							Datenschutz
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
