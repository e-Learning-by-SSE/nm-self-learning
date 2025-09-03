import { TrashIcon } from "@heroicons/react/24/outline";
import { Lesson } from "@prisma/client";
import { LessonFormModel } from "@self-learning/teaching";

export function ModuleView({
	modules,
	onSelectModule,
	selectedModuleId,
	onRemoveLesson
}: {
	modules: Map<string, LessonFormModel>;
	onSelectModule: (id: string) => void;
	selectedModuleId: string | null;
	onRemoveLesson: (lesson: LessonFormModel) => void;
}) {
	return (
		<div className="flex flex-col space-y-6">
			{modules.size > 0 ? (
				[...modules.values()].map(lesson => {
					const isSelected = lesson.lessonId === selectedModuleId;
					return (
						<div
							key={lesson.lessonId}
							onClick={() => lesson.lessonId && onSelectModule(lesson.lessonId)}
							className={`transition-all duration-200 ease-in-out transform hover:scale-[1.02] cursor-pointer px-6 py-4 rounded-xl shadow-sm border
								${isSelected ? "bg-emerald-50 ring-inset ring-2 ring-emerald-500 border-emerald-300" : "bg-white hover:bg-gray-50 border-gray-200"}`}
						>
							<div className="flex items-center justify-between">
								<div>
									<h3
										className={`text-lg font-semibold transition-colors duration-200
								${isSelected ? "text-emerald-600" : "text-gray-700 group-hover:text-emerald-500"}`}
									>
										{lesson.title || "Unbenanntes Modul"}
									</h3>
									{lesson.description && (
										<p className="text-sm text-gray-500 mt-1 line-clamp-2">
											{lesson.description}
										</p>
									)}
								</div>

								<div>
									<button
										type="button"
										onClick={e => {
											e.stopPropagation(); // prevent triggering onSelectModule
											onRemoveLesson(lesson);
										}}
									>
										<div className="ml-4">
											<TrashIcon className="icon text-red-500" />
										</div>
									</button>
								</div>
							</div>
						</div>
					);
				})
			) : (
				<div className="p-6 rounded-lg bg-gray-50 text-center border border-gray-200">
					<p className="text-gray-600 font-medium">Keine Module gefunden.</p>
					<p className="text-gray-500 mt-1">
						Bitte erstellen Sie ein Modul, um es hier anzuzeigen.
					</p>
				</div>
			)}
		</div>
	);
}
