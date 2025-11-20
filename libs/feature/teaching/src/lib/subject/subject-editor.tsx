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
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { FormProvider, useForm } from "react-hook-form";
import { Trans, useTranslation } from "next-i18next";

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
	const { t } = useTranslation("feature-teaching");
	const { t: t_common } = useTranslation("common");

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
								<span className="font-semibold text-c-primary">
									{initialSubject.subjectId === ""
										? t("Create Topic")
										: t("Edit Topic")}
								</span>

								<h1 className="text-2xl">
									{initialSubject.subjectId === ""
										? t("New Topic")
										: initialSubject.title}
								</h1>
							</div>

							<OpenAsJsonButton form={form} validationSchema={subjectSchema} />

							<button className="btn-primary w-full" type="submit">
								{initialSubject.subjectId === ""
									? t_common("create")
									: t_common("save")}
							</button>

							<Form.SidebarSection>
								<Form.SidebarSectionTitle
									title={t_common("Information_other")}
									subtitle={t("Information about the topic")}
								></Form.SidebarSectionTitle>
								<div className="flex flex-col gap-4">
									<LabeledField
										label={t_common("Title")}
										error={errors.title?.message}
									>
										<input
											className="textfield"
											type={"text"}
											{...form.register("title")}
											onBlur={slugifyIfEmpty}
										/>
									</LabeledField>

									<LabeledField
										label={t_common("Slug")}
										error={errors.slug?.message}
									>
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
													{t_common("Generate")}
												</button>
											}
										/>
										<FieldHint>
											<Trans
												t={t_common}
												i18nKey="Slug Description"
												components={{ strong: <strong /> }}
											/>
										</FieldHint>
									</LabeledField>

									<LabeledField
										label={t_common("Subtitle")}
										error={errors.subtitle?.message}
									>
										<textarea
											className="textfield"
											{...register("subtitle")}
											rows={16}
										/>
										<FieldHint>{t("Description of the topic")}</FieldHint>
									</LabeledField>
								</div>
							</Form.SidebarSection>
						</>
					}
				>
					<section>
						<SectionHeader
							title={t_common("Banner Image")}
							subtitle={t_common("Banner Image Description")}
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
							title={t_common("Tile Image")}
							subtitle={t_common("Tile Image Description")}
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
