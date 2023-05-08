import Link from "next/link";

export function Footer() {

    return(
            <footer className="bg-white border-t border-t-gray-200 z-20 py-4 relative">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between">
                        <div>
                            <Link href="https://www.uni-hildesheim.de/impressum/" target="_blank" className="text-sm font-medium hover:text-secondary">
                                Impressum
                            </Link>
                        </div>
                        <div>
                            <Link href="https://www.uni-hildesheim.de/datenschutz/" target="_blank" className="text-sm font-medium hover:text-secondary">
                                    Datenschutz
                            </Link>
                        </div>
                    </div>
                </div>
        </footer>
    );

}