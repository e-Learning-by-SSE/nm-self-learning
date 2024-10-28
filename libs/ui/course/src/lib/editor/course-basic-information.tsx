import { ExtendedCourseFormValues } from "@self-learning/teaching";
import { Controller, useFormContext } from "react-hook-form";
import { memo, useEffect, useState } from "react";
import {
	InputWithButton,
	LabeledField,
	SearchField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { AuthorsForm } from "libs/feature/teaching/src/lib/author/authors-form";
import { CourseSkillForm } from "libs/feature/teaching/src/lib/lesson/forms/skills-form";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import {
	Dialog,
	DialogActions,
	IconButton,
	ImageOrPlaceholder,
	LoadingBox,
	OnDialogCloseFn
} from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
//import { Author } from "@self-learning/types";
/*
import {
	InlineRemoveButton,
	SelectSkillsView
} from "libs/feature/teaching/src/lib/skills/skill-dialog/select-skill-view";
*/
//import { SelectSkillDialog } from "libs/feature/teaching/src/lib/skills/skill-dialog/select-skill-dialog";

export function CourseBasicInformation() {
	const form = useFormContext<ExtendedCourseFormValues>();

	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { data: authors = [] } = trpc.author.getAll.useQuery();

	const onSelectorChange = (authorSlug: string) => {
		console.log("on selector change", authorSlug);
	};

	const onAddAuthor = () => {};
	const onDeleteAuthor = () => {};

	return (
		<div className="m-2 grid w-2/3 grid-cols-1 gap-6 p-2 md:grid-cols-2">
			<div>
				<BasicInfo />
			</div>

			<div>
				<Skills />

				<Selectors
					authors={authors}
					onAddAuthor={onAddAuthor}
					onDeleteAuthor={onDeleteAuthor}
				/>
			</div>
		</div>
	);
}

type AuthorSelector = {
	displayName: string;
	slug: string; // TODO: is slug unique?
};

function Selectors({
	authors,
	onAddAuthor,
	onDeleteAuthor
}: {
	authors: AuthorSelector[];
	onAddAuthor: (authorSlug: AuthorSelector[] | undefined) => void;
	onDeleteAuthor: (author: AuthorSelector) => void;
}) {
	const [selectAuthorSelector, setSelectAuthorSelectorModal] = useState(false);

	return (
		<>
			<SidebarSectionTitle title="Selektoren" subtitle={"TODO"} />
			<LabeledField label="Authoren">
				<div className="flex flex-col">
					<IconButton
						type="button"
						data-testid="BenoetigteSkills-add"
						onClick={() => setSelectAuthorSelectorModal(true)}
						title="Hinzufügen"
						text="Hinzufügen"
						icon={<PlusIcon className="h-5" />}
					/>

					{authors.length === 0 && (
						<div className="mt-3 text-sm text-gray-500">Keine Authoren vorhanden</div>
					)}
					{/**
					<div className="mt-3 max-h-40 overflow-auto">
						{authors.map((author, index) => (
							<InlineRemoveButton
								key={index}
								label={author.displayName}
								onRemove={() => onDeleteAuthor(author)}
								onClick={() => {}} //TODO
							/>
						))}
					</div>
					*/}

					{selectAuthorSelector && (
						<SelectAuthorSelectorDialog
							onClose={author => {
								setSelectAuthorSelectorModal(false);
								onAddAuthor(author);
							}}
						/>
					)}
				</div>
			</LabeledField>
		</>
	);
}

export function SelectAuthorSelectorDialog({
	onClose
}: {
	onClose: OnDialogCloseFn<AuthorSelector[]>;
}) {
	return <AuthorSelectorModal onClose={onClose} />;
}

function AuthorSelectorModal({ onClose }: { onClose: OnDialogCloseFn<AuthorSelector[]> }) {
	const { data: authors, isLoading } = trpc.author.getAll.useQuery();

	return (
		<Dialog onClose={() => onClose(undefined)} title={"Füge die Skills hinzu"}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{authors && (
						<SelectSelectorForm
							onClose={onClose}
							//skills is missing some properties here
							authors={authors as AuthorSelector[]}
						/>
					)}
				</>
			)}
		</Dialog>
	);
}
function SelectSelectorForm({
	onClose,
	authors
}: {
	onClose: OnDialogCloseFn<AuthorSelector[]>;
	authors: AuthorSelector[];
}) {
	const [search, setSearch] = useState("");
	const [checkBoxMap, setCheckBoxMap] = useState(new Map<AuthorSelector, boolean>());
	useEffect(() => {
		const map = new Map<AuthorSelector, boolean>();
		authors.forEach(author => {
			map.set(author, false);
		});
		setCheckBoxMap(map);
	}, [authors]);

	const setAuthor = (author: AuthorSelector) => {
		checkBoxMap.set(author, !checkBoxMap.get(author));
	};

	const filteredSelectors =
		search !== ""
			? authors.filter(skill =>
					skill.displayName.toLowerCase().includes(search.toLowerCase())
				)
			: authors;

	return (
		<>
			<SearchField
				placeholder="Suche nach Skills"
				onChange={e => {
					setSearch(e.target.value);
				}}
			/>
			<div className="flex flex-col justify-between overflow-auto">
				<section className="flex h-64 flex-col rounded-lg border border-light-border p-4">
					<div className="flex flex-col">
						{authors.length === 0 && <p>Keine Skills vorhanden</p>}
						{authors.length > 0 && (
							<>
								{filteredSelectors
									.sort((a, b) => a.displayName.localeCompare(b.displayName))
									.map((skill, index) => (
										<span
											key={"span: " + skill.slug + index}
											className="flex items-center gap-2"
										>
											<SelectorElementMemorized
												key={skill.slug + index}
												skill={skill}
												value={checkBoxMap.get(skill) ?? false}
												setSkill={setAuthor}
											/>
										</span>
									))}
							</>
						)}
					</div>
				</section>
			</div>
			<DialogActions onClose={onClose}>
				<button
					className="btn-primary"
					onClick={() => {
						onClose(authors.filter(skill => checkBoxMap.get(skill)));
					}}
				>
					Speichern
				</button>
			</DialogActions>
		</>
	);
}
const SelectorElementMemorized = memo(SelectorElement);

function SelectorElement({
	skill,
	setSkill,
	value
}: {
	skill: AuthorSelector;
	setSkill: (skill: AuthorSelector) => void;
	value: boolean;
}) {
	const [checked, setChecked] = useState(value);

	useEffect(() => {
		setChecked(value);
	}, [value]);

	return (
		<>
			<input
				id={"checkbox:" + skill.slug}
				type={"checkbox"}
				className="checkbox"
				checked={checked}
				onChange={() => {
					setChecked(!checked);
					setSkill(skill);
				}}
			/>
			<label htmlFor={"checkbox:" + skill.slug} className="text-sm font-semibold">
				{skill.displayName}
			</label>
		</>
	);
}
//----------------------------------------------- here are good things not so experimata
function Skills() {
	const form = useFormContext<ExtendedCourseFormValues>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	return <CourseSkillForm />;
}

function BasicInfo() {
	const form = useFormContext<ExtendedCourseFormValues>();

	const {
		register,
		setValue,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	const { data: subjects = [] } = trpc.subject.getAllSubjects.useQuery();
	useEffect(() => {
		if (subjects.length > 0) {
			setValue("subjectId", subjects[0]?.subjectId || "");
		} else {
			console.error("Failed to fetch subjects from DB!");
		}
	}, [subjects, setValue]);

	const { data: specializations = [] } = trpc.specialization.getAll.useQuery();
	useEffect(() => {
		if (specializations.length > 0) {
			setValue("specializationId", specializations[0]?.specializationId || "");
		} else {
			console.error("Failed to fetch specializations from DB!");
		}
	});

	const onSubjectChange = (subjectId: string) => {
		setValue("subjectId", subjectId);
	};
	const onSpecializationChange = (specializationId: string) => {
		setValue("specializationId", specializationId);
	};

	return (
		<>
			<LabeledField label="Titel" error={errors.title?.message}>
				<input
					{...register("title")}
					type="text"
					className="textfield"
					placeholder="Der neue Kurs"
					onBlur={slugifyIfEmpty}
				/>
			</LabeledField>
			<LabeledField label="Slug" error={errors.slug?.message}>
				<InputWithButton
					input={
						<input
							className="textfield"
							placeholder="der-neue-Kurs"
							type={"text"}
							{...register("slug")}
						/>
					}
					button={
						<button type="button" className="btn-stroked" onClick={slugifyField}>
							Generieren
						</button>
					}
				/>
			</LabeledField>

			<LabeledField label="Beschreibung" error={errors.description?.message}>
				<textarea {...register("description")} placeholder="" className="h-full" />
			</LabeledField>

			<LabeledField label="Fachgebiet" error={errors.subjectId?.message}>
				<SubjectDropDown subjects={subjects} onChange={onSubjectChange} />
			</LabeledField>

			<LabeledField label="Spezialisierung" error={errors.specializationId?.message}>
				<SpecializationDropDown
					specializations={specializations}
					onChange={onSpecializationChange}
				/>
			</LabeledField>

			{/** TODO: who knows if it works - cannot connect to MinIO */}
			<Controller
				control={form.control}
				name="imgUrl"
				render={({ field }) => (
					<LabeledField label="Bild" error={errors.imgUrl?.message}>
						<div className="flex w-full gap-4">
							<div className="flex w-full flex-col gap-2">
								<Upload
									mediaType="image"
									onUploadCompleted={field.onChange}
									preview={
										<ImageOrPlaceholder
											src={field.value ?? undefined}
											className="mx-auto h-32 w-32 shrink-0 rounded-lg"
										/>
									}
								/>
							</div>
						</div>
					</LabeledField>
				)}
			></Controller>

			<div className="my-5 border-t border-gray-200">
				<AuthorsForm
					subtitle="Die Autoren dieses Kurses."
					emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
				/>
			</div>
		</>
	);
}

type subject = {
	subjectId: string;
	title: string;
};

function SubjectDropDown({
	subjects,
	onChange
}: {
	subjects: subject[];
	onChange: (id: string) => void;
}) {
	const [selectedSubject, setSelectedSubject] = useState<string>(subjects?.[0]?.subjectId ?? "");

	const changeDisplaySelectedRepository = (id: string) => {
		setSelectedSubject(id);
	};

	useEffect(() => {
		onChange(selectedSubject);
	}, [onChange, selectedSubject]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedSubject ?? subjects[0].subjectId}
				onChange={e => {
					changeDisplaySelectedRepository(e.target.value);
				}}
			>
				{subjects.map(subject => (
					<option key={subject.subjectId} value={subject.subjectId}>
						{subject.title}
					</option>
				))}
			</select>
		</div>
	);
}

type specialization = {
	specializationId: string;
	title: string;
};

function SpecializationDropDown({
	specializations,
	onChange
}: {
	specializations: specialization[];
	onChange: (id: string) => void;
}) {
	const [selectedSpecialization, setSelectedSpecialization] = useState<string>(
		specializations?.[0]?.specializationId ?? ""
	);

	const changeDisplaySelectedSpecialization = (id: string) => {
		setSelectedSpecialization(id);
	};

	useEffect(() => {
		onChange(selectedSpecialization);
	}, [onChange, selectedSpecialization]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedSpecialization ?? specializations[0].specializationId}
				onChange={e => {
					changeDisplaySelectedSpecialization(e.target.value);
				}}
			>
				{specializations.map(specialization => (
					<option
						key={specialization.specializationId}
						value={specialization.specializationId}
					>
						{specialization.title}
					</option>
				))}
			</select>
		</div>
	);
}
/*
function Selectors({ authors, onChange }: { authors: Author[]; onChange: (id: string) => void }) {
	const [openAddDialog, setOpenAddDialog] = useState(false);

	const handleAdd = () => {
		// TODO
		setOpenAddDialog(false);
	};
	const [selectedSpecialization, setSelectedSpecialization] = useState<string>(
		authors?.[0]?.displayName ?? ""
	);

	const changeDisplaySelectedRepository = (slug: string) => {
		setSelectedSpecialization(slug);
	};
	return (
		<div className="my-5">
			<SidebarSectionTitle
				title="Selektoren"
				subtitle="Begrenzung der Menge berücksichtigter Module"
			/>
			<div className="my-2 flex flex-col">
				<IconButton
					type="button"
					data-testid="author-add"
					onClick={() => setOpenAddDialog(true)}
					title="Hinzufügen"
					text="Hinzufügen"
					icon={<PlusIcon className="h-5" />}
				/>
			</div>
			<div className="flex flex-col">
				<select
					className="textfield"
					value={selectedSpecialization ?? authors[0].slug}
					onChange={e => {
						changeDisplaySelectedRepository(e.target.value);
					}}
				>
					{authors.map(author => (
						<option key={author.displayName} value={author.displayName}>
							{author.displayName}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}*/
