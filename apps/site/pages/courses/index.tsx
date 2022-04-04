import { SidebarLayout } from "@self-learning/ui/layouts";

export default function Courses() {
	return (
		<SidebarLayout isSidebarOpen={true}>
			<div className="flex flex-col">
				<h1 className="mb-8 text-3xl">Empfohlene Kurse</h1>
				<div className="flex flex-wrap gap-4">
					{["A", "B", "C", "D"].map(key => (
						<div className="rounded bg-slate-100 p-4" key={key}>
							<h2>{key}</h2>
						</div>
					))}
				</div>
			</div>
		</SidebarLayout>
	);
}
