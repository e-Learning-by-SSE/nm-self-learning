import { PlusIcon } from "@heroicons/react/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppRouter } from "@self-learning/api";
import { Subject, subjectSchema } from "@self-learning/types";
import { ImageOrPlaceholder, SectionHeader } from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	TextfieldWithButton,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { inferRouterOutputs } from "@trpc/server";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { FormProvider, useForm } from "react-hook-form";

export function SubjectEditor({
	initialSubject,
	onSubmit,
	specializations
}: {
	initialSubject: Subject;
	onSubmit: (s: Subject) => unknown;
	specializations: inferRouterOutputs<AppRouter>["subject"]["getSubjectForEdit"]["specializations"];
}) {
	const methods = useForm<Subject>({
		resolver: zodResolver(subjectSchema),
		defaultValues: initialSubject
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(methods, "title", "slug");
	const cardImgUrl = methods.watch("cardImgUrl");
	const imgUrlBanner = methods.watch("imgUrlBanner");

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

									{/* <div className="flex gap-2">
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
									</div> */}

									<LabeledField label="Slug" error={errors.slug?.message}>
										<InputWithButton
											input={
												<input
													className="textfield"
													type={"text"}
													{...methods.register("slug")}
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
							onUploadCompleted={url => methods.setValue("imgUrlBanner", url)}
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
							onUploadCompleted={url => methods.setValue("cardImgUrl", url)}
							preview={
								<ImageOrPlaceholder
									src={cardImgUrl ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>

					<section>
						<SectionHeader
							title="Spezialisierungen"
							subtitle="Spezialisierungen dieses Fachgebiets."
						/>

						{initialSubject.subjectId === "" ? (
							<p className="text-sm text-light">
								Spezialisierungen können erst hinzugefügt werden, nachdem das
								Fachgebiet erstellt wurde.
							</p>
						) : (
							<>
								<a
									rel="noopener noreferrer"
									target="_blank"
									className="btn-primary with-icon mb-8 w-fit"
									href={`/teaching/subjects/${initialSubject.subjectId}/specializations/`}
								>
									<PlusIcon className="h-5" />
									<span>Hinzufügen</span>
								</a>

								<ul className="flex flex-col gap-4">
									{specializations.map(spec => (
										<li
											key={spec.specializationId}
											className="flex rounded-lg border border-light-border bg-white"
										>
											<ImageOrPlaceholder
												src={spec.cardImgUrl ?? undefined}
												className="w-32 rounded-l-lg object-cover"
											/>
											<div className="flex flex-col justify-between gap-4 p-4">
												<div className="flex flex-col gap-2">
													<span className="text-lg font-semibold">
														{spec.title}
													</span>
													<p className="text-sm text-light">
														{spec.subtitle}
													</p>
												</div>

												<div className="flex">
													<a
														className="btn-stroked"
														rel="noopener noreferrer"
														target="_blank"
														href={`/teaching/subjects/${initialSubject.subjectId}/specializations/edit/${spec.specializationId}`}
													>
														Editieren
													</a>
												</div>
											</div>
										</li>
									))}
								</ul>
							</>
						)}
					</section>
				</SidebarEditorLayout>
			</form>
		</FormProvider>
	);
}
