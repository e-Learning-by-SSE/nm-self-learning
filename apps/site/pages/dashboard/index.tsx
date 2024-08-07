import { CogIcon, PencilIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthenticatedUser } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { StudentSettingsDialog } from "@self-learning/settings";
import {
	Card,
	Dialog,
	DialogActions,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	ImageCard,
	ImageCardBadge,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	showToast,
	Toggle
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { formatDateAgo } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ReactComponent as TutorialSvg } from "../../svg/tutorial.svg";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StudentSettings } from "@self-learning/types";

type Student = Awaited<ReturnType<typeof getStudent>>;

type Props = {
	student: Student;
};

function getStudent(username: string) {
	return database.student.findUniqueOrThrow({
		where: { username },
		select: {
			_count: {
				select: {
					completedLessons: true
				}
			},
			settings: true,
			user: {
				select: {
					displayName: true,
					name: true,
					image: true
				}
			},
			completedLessons: {
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
					lesson: {
						select: {
							slug: true,
							title: true
						}
					},
					course: {
						select: {
							slug: true,
							title: true,
							imgUrl: true
						}
					}
				}
			},
			enrollments: {
				orderBy: { createdAt: "desc" },
				select: {
					progress: true,
					status: true,
					lastProgressUpdate: true,
					course: {
						select: {
							slug: true,
							title: true,
							subtitle: true,
							imgUrl: true
						}
					}
				}
			}
		}
	});
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
	const user = await getAuthenticatedUser(ctx);
	if (!user || !user.name) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	const student = await getStudent(user.name);

	return {
		props: {
			student: JSON.parse(JSON.stringify(student)) // using parse to deal with date type :(
		}
	};
};

export default function Start(props: Props) {
	return <DashboardPage {...props} />;
}

function DashboardPage(props: Props) {
	const [editStudentDialog, setEditStudentDialog] = useState(false);
	const [studentSettings, setStudentSettings] = useState<StudentSettings>({
		hasLearningDiary: props.student.settings?.hasLearningDiary ?? false,
		learningStatistics: props.student.settings?.learningStatistics ?? false
	});
	const { mutateAsync: updateStudent } = trpc.me.updateStudent.useMutation();
	const router = useRouter();

	const onEditStudentClose: Parameters<
		typeof EditStudentDialog
	>[0]["onClose"] = async updated => {
		setEditStudentDialog(false);

		if (updated) {
			try {
				await updateStudent(updated);
				showToast({
					type: "success",
					title: "Informationen aktualisiert",
					subtitle: updated.user.displayName
				});
				router.replace(router.asPath);
			} catch (error) {
				console.error(error);

				if (error instanceof TRPCClientError) {
					showToast({ type: "error", title: "Fehler", subtitle: error.message });
				}
			}
		}
	};

	return (
		<div className="bg-gray-50">
			<CenteredSection>
				<div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-[2fr_1fr]">
					<section className="flex items-center">
						<ImageOrPlaceholder
							src={props.student.user.image ?? undefined}
							className="h-24 w-24 rounded-lg object-cover"
						/>
						<div className="flex flex-col gap-4 pl-8 pr-4">
							<h1 className="text-6xl">{props.student.user.displayName}</h1>
							<span>
								Du hast bereits{" "}
								<span className="mx-1 font-semibold text-secondary">
									{props.student._count.completedLessons}
								</span>{" "}
								{props.student._count.completedLessons === 1
									? "Lerneinheit"
									: "Lerneinheiten"}{" "}
								abgeschlossen.
							</span>
						</div>

						<button
							className="self-start rounded-full p-2 hover:bg-gray-100"
							title="Bearbeiten"
							onClick={() => setEditStudentDialog(true)}
						>
							<CogIcon className="h-5 text-gray-400" />
						</button>

						{editStudentDialog && (
							<EditStudentDialog
								student={{ user: { displayName: props.student.user.displayName } }}
								onClose={onEditStudentClose}
							/>
						)}
					</section>

					<div className="mt-4 flex items-end gap-2 justify-self-end">
						<TagebuchToggle
							onChange={value => {
								setStudentSettings(value);
							}}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
					<div className="rounded bg-white p-4 shadow">
						<h2 className="mb-4 text-xl">Letzter Kurs</h2>
						<LastCourseProgress lastEnrollment={props.student.enrollments[0]} />
					</div>

					<div className="rounded bg-white p-4 shadow">
						{studentSettings?.hasLearningDiary &&
						studentSettings?.learningStatistics ? (
							<>
								<h2 className="mb-4 text-xl">Letzter Lerntagebucheintrag</h2>
								<LastLearningDiaryEntry />
							</>
						) : (
							<>
								<h2 className="mb-4 text-xl">Zuletzt bearbeitete Lerneinheiten</h2>
								<Activity enrollments={props.student.enrollments} />
							</>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8 pt-10 xl:grid-cols-2">
					{studentSettings?.hasLearningDiary && studentSettings?.learningStatistics && (
						<>
							<Card
								href="/dashboard/courseOverview"
								imageElement={<TutorialSvg />}
								title="Lerneinheiten verwalten"
							/>
							<Card
								href="/diary/createEntry"
								imageElement={<TutorialSvg />}
								title="Lerntagebucheinträge verwalten"
							/>

							<Card
								href="/diary/overview"
								imageElement={<TutorialSvg />}
								title="Lerntagebuchübersicht einsehen"
							/>

							<Card
								href="/learning-goals"
								imageElement={<TutorialSvg />}
								title="Lernziele verwalten"
							/>
						</>
					)}
				</div>
			</CenteredSection>
			<DialogHandler id="studentSettingsDialogDashboard" />
		</div>
	);
}

function TagebuchToggle({ onChange }: { onChange: (value: StudentSettings) => void }) {
	const { data: studentSettings, isLoading, refetch } = trpc.settings.getMySetting.useQuery();
	const hasLearningDiary = studentSettings?.hasLearningDiary || false;
	const hasLearningStatistics = studentSettings?.learningStatistics || false;

	return (
		<>
			{!isLoading && (
				<Toggle
					value={hasLearningDiary && hasLearningStatistics}
					onChange={() => {
						dispatchDialog(
							<StudentSettingsDialog
								initialSettings={{
									hasLearningDiary: false,
									learningStatistics: false,
									...studentSettings
								}}
								onClose={value => {
									refetch();
									onChange({
										hasLearningDiary: value?.hasLearningDiary ?? false,
										learningStatistics: value?.learningStatistics ?? false
									});
									freeDialog("studentSettingsDialogDashboard");
								}}
							/>,
							"studentSettingsDialogDashboard"
						);
					}}
					label="Lerntagebuch"
				/>
			)}
		</>
	);
}

function LastLearningDiaryEntry() {
	const { data: learningDiaryEntries, isLoading } =
		trpc.learningDiaryEntry.getMeLearningDiaryEntries.useQuery();

	return (
		<>
			{learningDiaryEntries && learningDiaryEntries.length == 0 ? (
				<span className="text-sm text-light">
					Du hast noch keinen Lerntagebucheintrag erstellt.
				</span>
			) : (
				<>
					{!isLoading && learningDiaryEntries && (
						<ul className="flex flex-col gap-2 overflow-auto overflow-x-hidden max-h-80">
							{learningDiaryEntries.map((entry, index) => (
								<Link
									className="text-sm font-medium"
									href={`/courses/${entry.course.slug}/`}
									key={"course-" + index}
								>
									<li
										className="hover: flex items-center rounded-lg border border-light-border 
							p-3 transition-transform hover:scale-105 hover:bg-slate-100 hover:shadow-lg"
									>
										<div className="flex w-full flex-wrap items-center justify-between gap-2 px-4">
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-1">
													{index < 2 && (
														<PencilIcon className="h-5 text-emerald-500" />
													)}
													Eintrag {entry.number}. {entry.course.title}
												</div>
											</div>
											<span className="hidden text-sm text-light md:block">
												{entry.date}
											</span>
										</div>
									</li>
								</Link>
							))}
						</ul>
					)}
				</>
			)}
		</>
	);
}

function Activity({ enrollments }: { enrollments: Student["enrollments"] }) {
	const notCompletedCourses = enrollments.filter(enrollment => enrollment.status === "ACTIVE");

	return (
		<>
			{notCompletedCourses.length === 0 ? (
				<span className="text-sm text-light">
					Du bist momentan in keinem Kurs eingeschrieben.
				</span>
			) : (
				<ul className="flex flex-col gap-2 overflow-auto overflow-x-hidden max-h-80">
					{notCompletedCourses.map((completion, index) => (
						<Link
							className="text-sm font-medium"
							href={`/courses/${completion.course?.slug}`}
							key={"course-" + index}
						>
							<li
								className="hover: flex items-center rounded-lg border border-light-border 
							pl-3 transition-transform hover:scale-105 hover:bg-slate-100 hover:shadow-lg"
							>
								<ImageOrPlaceholder
									src={completion.course?.imgUrl ?? undefined}
									className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
								/>

								<div className="flex w-full flex-wrap items-center justify-between gap-2 px-4">
									<div className="flex flex-col gap-1">
										{completion.course?.title}
									</div>
									<ProgressFooter progress={completion.progress} />
									<span className="hidden text-sm text-light md:block">
										{formatDateAgo(completion.lastProgressUpdate)}
									</span>
								</div>
							</li>
						</Link>
					))}
				</ul>
			)}
		</>
	);
}

function ProgressFooter({ progress }: { progress: number }) {
	return (
		<span className="relative h-5 w-full rounded-lg bg-gray-200">
			<span
				className="absolute left-0 h-5 rounded-lg bg-secondary"
				style={{ width: `${progress}%` }}
			></span>
			<span
				className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
					progress === 0 ? "text-secondary" : "text-white"
				}`}
			>
				{progress}%
			</span>
		</span>
	);
}

function LastCourseProgress({ lastEnrollment }: { lastEnrollment?: Student["enrollments"][0] }) {
	if (!lastEnrollment) {
		return (
			<div>
				<span className="text-sm text-light">
					Du bist momentan in keinem Kurs eingeschrieben.
				</span>
				<Link
					href="/subjects"
					className="ml-1 text-sm text-light underline hover:text-secondary"
				>
					Leg los
				</Link>
			</div>
		);
	}
	return (
		<div>
			{lastEnrollment && lastEnrollment.course && (
				<Link
					key={lastEnrollment.course.slug}
					href={`/courses/${lastEnrollment.course.slug}`}
				>
					<ImageCard
						slug={lastEnrollment.course.slug}
						title={lastEnrollment.course.title}
						subtitle={lastEnrollment.course.subtitle}
						imgUrl={lastEnrollment.course.imgUrl}
						badge={
							lastEnrollment.status === "COMPLETED" ? (
								<ImageCardBadge
									className="bg-emerald-500 text-white"
									text="Abgeschlossen"
								/>
							) : (
								<></>
							)
						}
						footer={<ProgressFooter progress={lastEnrollment.progress} />}
					/>
				</Link>
			)}
		</div>
	);
}

const editStudentSchema = z.object({
	user: z.object({ displayName: z.string().min(3).max(50) })
});

type EditStudent = z.infer<typeof editStudentSchema>;

function EditStudentDialog({
	student,
	onClose
}: {
	student: EditStudent;
	onClose: OnDialogCloseFn<EditStudent>;
}) {
	const form = useForm({
		defaultValues: student,
		resolver: zodResolver(editStudentSchema)
	});

	return (
		<Dialog title={student.user.displayName} onClose={onClose}>
			<form onSubmit={form.handleSubmit(onClose)}>
				<LabeledField label="Name" error={form.formState.errors.user?.displayName?.message}>
					<input
						{...form.register("user.displayName")}
						type="text"
						className="textfield"
					/>
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button className="btn-primary" disabled={!form.formState.isValid}>
						Speichern
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
