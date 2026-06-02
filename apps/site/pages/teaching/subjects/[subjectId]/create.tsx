import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import {
	resourcePermissionSelect,
	Specialization,
	specializationSchema,
	toResourcePermissionsForm
} from "@self-learning/types";
import { ImageOrPlaceholder, SectionHeader, showToast } from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import {
	SidebarEditorLayout,
	testResourceGuard,
	useResourceGuard
} from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { withTranslations } from "@self-learning/api";
import { GroupAccessEditor } from "libs/feature/teaching/src/lib/group/forms/group-form";
import { withAuth } from "@self-learning/util/auth";
import { database } from "@self-learning/database";
import { AccessLevel } from "@prisma/client";

type CreateSpecializationProps = {
	subjectId: string;
};

export default function SpecializationPage({ subjectId }: CreateSpecializationProps) {
	const router = useRouter();
	const { mutateAsync: createSpecialization } = trpc.specialization.create.useMutation();

	const onSubmit: Parameters<typeof SpecializationEditor>[0]["onSubmit"] = async specFromForm => {
		try {
			const spec = await createSpecialization({
				subjectId,
				data: specFromForm
			});

			showToast({ type: "success", title: "Spezialisierung erstellt", subtitle: spec.title });
			router.push(`/teaching/subjects/${subjectId}/${spec.specializationId}/edit`);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	};

	return (
		<SpecializationEditor
			onSubmit={onSubmit}
			initialSpecialization={{
				permissions: [],
				specializationId: "",
				subjectId,
				title: "",
				slug: "",
				subtitle: "",
				cardImgUrl: null,
				imgUrlBanner: null
			}}
		/>
	);
}

export function SpecializationEditor({
	initialSpecialization,
	onSubmit
}: {
	initialSpecialization: Specialization;
	onSubmit: (specialization: Specialization) => void;
}) {
	const form = useForm<Specialization>({
		resolver: zodResolver(specializationSchema),
		defaultValues: initialSpecialization
	});

	const isNew = initialSpecialization.specializationId === "";
	const hasFull = useResourceGuard(AccessLevel.FULL, initialSpecialization.permissions);
	const showGroupAccessEditor = isNew || hasFull;

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
								<span className="font-semibold text-c-primary">
									Spezialisierung {isNew ? "erstellen" : "bearbeiten"}
								</span>

								<h1 className="text-2xl">
									{isNew ? "Neue Spezialisierung" : initialSpecialization.title}
								</h1>
							</div>

							<OpenAsJsonButton form={form} validationSchema={specializationSchema} />

							<button className="btn-primary w-full" type="submit">
								{isNew ? "Erstellen" : "Speichern"}
							</button>

							<Form.SidebarSection>
								<Form.SidebarSectionTitle
									title="Informationen"
									subtitle="Informationen über diese Spezialisierung."
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
											Beschreibung dieser Spezialisierung in 2-3 Sätzen.
										</FieldHint>
									</LabeledField>
								</div>
								{showGroupAccessEditor && (
									<GroupAccessEditor
										subtitle="Gruppen, die auf diese Spezialisierung zugreifen können"
										doUseDefaultGroup={isNew}
									/>
								)}
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

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<CreateSpecializationProps>(async (ctx, user) => {
		const subjectId = ctx.params?.subjectId;

		if (typeof subjectId !== "string") {
			return { notFound: true };
		}

		const subject = await database.subject.findUnique({
			where: { subjectId },
			select: {
				permissions: {
					select: resourcePermissionSelect
				}
			}
		});

		if (!subject) {
			return { notFound: true };
		}

		const permissions = toResourcePermissionsForm(subject.permissions);
		if (!testResourceGuard(user, AccessLevel.EDIT, permissions)) {
			return { redirect: { destination: "/403", permanent: false } };
		}

		return { props: { subjectId } };
	})
);
