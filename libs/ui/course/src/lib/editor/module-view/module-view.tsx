import { LessonFormModel } from "@self-learning/teaching";

export function ModuleView({
	modules,
	onSelectModule
}: {
	modules: Map<string, LessonFormModel>;
	onSelectModule: (id: string) => void;
}) {
	return (
		<div className="flex flex-col space-y-4">
			{modules.size > 0 ? (
				[...modules.values()].map(lesson => (
					<div
						key={lesson.lessonId}
						className={`cursor-pointer p-4 bg-white rounded-lg shadow-md group ${lesson === [...modules.values()][0] ? "mt-6" : ""}`}
						onClick={() => {
							const id = lesson.lessonId;
							if (id) onSelectModule(id);
						}}
					>
						<h3 className="group-hover:text-emerald-500 text-gray-600 transition-colors duration-200">
							{lesson.title}
						</h3>
					</div>
				))
			) : (
				<div className="p-4">
					<p className="text-gray-500">Keine Module gefunden.</p>
					<p className="text-gray-500">
						Bitte erstellen Sie ein Modul, um es anzuzeigen.
					</p>
				</div>
			)}
		</div>
	);
}
