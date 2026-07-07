import { CourseFormModel } from "../course/course-form-model";

export function DynCourseEditor({
	course,
	onConfirm
}: {
	course: CourseFormModel;
	onConfirm: (course: CourseFormModel) => void;
}) {
	const isNew = initialLesson === null || initialLesson === undefined;
	const router = useRouter();
	const session = useRequiredSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	function onCancel() {
		if (window.confirm("Änderungen verwerfen?")) {
			router.back();
		}
	}

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, showValidationErrors)}
				className="w-full"
			>
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-c-primary">
								{initialLesson ? "Lerneinheit bearbeiten" : "Lerneinheit erstellen"}
							</span>
							<h1 className="text-4xl">{initialLesson?.title}</h1>
						</div>
						<div className="pointer-events-auto">
							<DialogActions onClose={onCancel}>
								<OpenAsJsonButton form={form} validationSchema={lessonSchema} />
								<button type="submit" className="btn-primary pointer-events-auto">
									{isNew ? "Erstellen" : "Speichern"}
								</button>
							</DialogActions>
						</div>
					</div>
					<div>
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>Grunddaten</Tab>
							<Tab>Lerninhalt</Tab>
							<Tab>Lernkontrolle</Tab>
						</Tabs>
						{selectedTab === 0 && <LessonInfoEditor isNew={isNew} />}
						{selectedTab === 1 && <LessonContentEditor />}
						{selectedTab === 2 && <QuizEditor />}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
