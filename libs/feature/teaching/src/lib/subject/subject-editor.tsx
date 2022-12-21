import { zodResolver } from "@hookform/resolvers/zod";
import { Subject, subjectSchema } from "@self-learning/types";
import { ImageOrPlaceholder, SectionHeader } from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { FormProvider, useForm } from "react-hook-form";

export function SubjectEditor({
	initialSubject,
	onSubmit
}: {
	initialSubject: Subject;
	onSubmit: (s: Subject) => unknown;
}) {
	const form = useForm<Subject>({
		resolver: zodResolver(subjectSchema),
		defaultValues: initialSubject
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");
	const cardImgUrl = form.watch("cardImgUrl");
	const imgUrlBanner = form.watch("imgUrlBanner");

	const {
		register,
		formState: { errors }
	} = form;

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<SidebarEditorLayout
					sidebar={
						<>
							<div>
								<span className="font-semibold text-secondary">
									Fachgebiet{" "}
									{initialSubject.subjectId === "" ? "erstellen" : "speichern"}
								</span>

								<h1 className="text-2xl">
									{initialSubject.subjectId === ""
										? "Neues Fachgebiet"
										: initialSubject.title}
								</h1>
							</div>

							<OpenAsJsonButton form={form} validationSchema={subjectSchema} />

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
											{...form.register("title")}
											onBlur={slugifyIfEmpty}
										/>
									</LabeledField>

									<LabeledField label="Slug" error={errors.slug?.message}>
										<InputWithButton
											input={
												<input
													className="textfield"
													type={"text"}
													{...form.register("slug")}
												/>
											}
											button={
												<button
													type="button"
													className="btn-stroked"
													onClick={slugifyField}
												>
													Generieren
												</button>
											}
										/>
										<FieldHint>
											Der <strong>slug</strong> wird in der URL angezeigt.
											Muss einzigartig sein.
										</FieldHint>
									</LabeledField>

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
				>
					<section>
						<SectionHeader
							title="Bild (Banner)"
							subtitle="Bild, das als Banner am Seitenbeginn angezeigt wird."
						/>

						<Upload
							mediaType="image"
							onUploadCompleted={url => form.setValue("imgUrlBanner", url)}
							preview={
								<ImageOrPlaceholder
									src={imgUrlBanner ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>

					<section className="w-fit">
						<SectionHeader
							title="Bild (Karte)"
							subtitle="Bild das auf Karten angezeigt wird."
						/>

						<Upload
							mediaType="image"
							onUploadCompleted={url => form.setValue("cardImgUrl", url)}
							preview={
								<ImageOrPlaceholder
									src={cardImgUrl ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>
				</SidebarEditorLayout>
			</form>
		</FormProvider>
	);
}
