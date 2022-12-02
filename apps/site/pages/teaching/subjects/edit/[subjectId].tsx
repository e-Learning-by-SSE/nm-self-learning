import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { Subject, subjectSchema } from "@self-learning/types";
import { LoadingBox, showToast } from "@self-learning/ui/common";
import { FieldHint, Form, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";

export default function SubjectEditPage() {
	const { subjectId } = useRouter().query;
	const { data: subject } = trpc.subject.getSubjectForEdit.useQuery(
		{
			subjectId: subjectId as string
		},
		{
			enabled: !!subjectId // router query is undefined on first render
		}
	);
	const { mutateAsync: updateSubject } = trpc.subject.updateSubject.useMutation();
	const trpcContext = trpc.useContext();

	async function onSubmit(subjectFromForm: Subject) {
		try {
			console.log("Updating subject", subjectFromForm);
			const res = await updateSubject(subjectFromForm);
			showToast({
				type: "success",
				title: "Fachgebiet aktualisiert",
				subtitle: `Das Fachgebiet "${res.title}" wurde aktualisiert.`
			});
		} catch (error) {
			console.error("Error updating subject", error);
		} finally {
			trpcContext.invalidate();
		}
	}

	return (
		<div className="flex flex-col bg-gray-50">
			{!subject ? (
				<LoadingBox />
			) : (
				<SubjectForm initialSubject={subject} onSubmit={onSubmit} />
			)}
		</div>
	);
}

function SubjectForm({
	initialSubject,
	onSubmit
}: {
	initialSubject: Subject;
	onSubmit: (s: Subject) => unknown;
}) {
	const methods = useForm<Subject>({
		resolver: zodResolver(subjectSchema),
		defaultValues: initialSubject
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(methods, "title", "slug");

	const {
		register,
		formState: { errors }
	} = methods;

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<SidebarEditorLayout
					sidebar={
						<>
							<div>
								<span className="font-semibold text-secondary">
									Fachgebiet editieren
								</span>

								<h1 className="text-2xl">{initialSubject.title}</h1>
							</div>

							<OpenAsJsonButton validationSchema={subjectSchema} />

							<button className="btn-primary w-full" type="submit">
								{initialSubject.subjectId === "" ? "Erstellen" : "Speichern"}
							</button>

							<Form.SidebarSection>
								<Form.SidebarSectionTitle
									title="Informationen"
									subtitle="Informationen über dieses Fachgebiet."
								></Form.SidebarSectionTitle>
								<div className="flex flex-col gap-4">
									<LabeledField label="Titel" error={errors.title?.message}>
										<input
											className="textfield"
											type={"text"}
											{...methods.register("title")}
											onBlur={slugifyIfEmpty}
										/>
									</LabeledField>

									<div className="flex gap-2">
										<LabeledField label="Slug" error={errors.slug?.message}>
											<input
												className="textfield w-full"
												type={"text"}
												{...methods.register("slug")}
											/>
											<FieldHint>
												Der <strong>slug</strong> wird in der URL angezeigt.
												Muss einzigartig sein.
											</FieldHint>
										</LabeledField>
										<button
											type="button"
											className="btn-stroked mt-2 h-fit self-center"
											onClick={slugifyField}
										>
											Generieren
										</button>
									</div>

									<LabeledField
										label="Untertitel"
										error={errors.subtitle?.message}
									>
										<textarea
											className="textfield"
											{...register("subtitle")}
											rows={16}
										/>
										<FieldHint>
											Beschreibung dieses Fachgebiets in 2-3 Sätzen.
										</FieldHint>
									</LabeledField>
								</div>
							</Form.SidebarSection>
						</>
					}
				></SidebarEditorLayout>
			</form>
		</FormProvider>
	);
}

function SidebarEditorLayout({
	sidebar,
	children
}: {
	children?: React.ReactNode;
	sidebar?: React.ReactNode;
}) {
	return (
		<div className="mx-auto grid max-w-[1920px] gap-8 xl:grid-cols-[500px_1fr]">
			<aside className="playlist-scroll top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:sticky xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r">
				<div className="flex flex-col px-4 pb-8">
					<div className="sticky top-0 z-10 flex flex-col gap-2 border-light-border pt-8 pb-4">
						{sidebar}
					</div>
				</div>
			</aside>

			<div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 pt-8 pb-16">
				{children}
			</div>
		</div>
	);
}
