import { getAuthenticatedUser } from "@self-learning/api";
import { database } from "@self-learning/database";
import { Card, ImageCard, ImageCardBadge, ImageOrPlaceholder } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { formatDateAgo } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import Link from "next/link";

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
				orderBy: { lastProgressUpdate: "desc" },
				select: {
					progress: true,
					status: true,
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
	return (
		<div className="bg-gray-50">
			<CenteredSection>
				<div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
					<div className="rounded bg-white p-4 shadow">
						<h2 className="mb-4 text-xl">Letzter Kurs</h2>
						<LastCourseProgress lastEnrollment={props.student.enrollments[0]} />
					</div>

					<div className="rounded bg-white p-4 shadow">
						<h2 className="mb-4 text-xl">Zuletzt bearbeitete Lerneinheiten</h2>
						<Activity completedLessons={props.student.completedLessons} />
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-10">
					<Card
						href="/dashboard/courseOverview"
						imageElement={<span>Belegte Kurse</span>}
						title="Lerneinheiten verwalten"
					/>

					<Card
						href="/admin/courses"
						imageElement={<span>Kurse verwalten</span>}
						title="Kurse verwalten"
					/>

					<Card
						href="/admin/subjects"
						imageElement={<span>Lerntagebuch</span>}
						title="Fachgebiete verwalten"
					/>

					<Card
						href="/admin/authors"
						imageElement={<span>Lernziele</span>}
						title="Autoren verwalten"
					/>
				</div>
			</CenteredSection>
		</div>
	);
}

function Activity({ completedLessons }: { completedLessons: Student["completedLessons"] }) {
	return (
		<>
			{completedLessons.length === 0 ? (
				<span className="text-sm text-light">
					Du bist momentan in keinem Kurs eingeschrieben.
				</span>
			) : (
				<ul className="flex flex-col gap-2">
					{completedLessons.map(lesson => (
						<li
							key={lesson.createdAt as unknown as string}
							className="flex items-center rounded-lg border border-light-border"
						>
							<ImageOrPlaceholder
								src={lesson.course?.imgUrl ?? undefined}
								className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
							/>

							<div className="flex w-full flex-wrap items-center justify-between gap-2 px-4">
								<div className="flex flex-col gap-1">
									<Link
										className="text-sm font-medium hover:text-secondary"
										href={`/courses/${lesson.course?.slug}/${lesson.lesson.slug}`}
									>
										{lesson.lesson.title}
									</Link>
									{lesson.course && (
										<span className="text-xs text-light">
											in{" "}
											<Link
												className="text-secondary hover:underline"
												href={`/courses/${lesson.course.slug}`}
											>
												{lesson.course.title}
											</Link>
										</span>
									)}
								</div>
								<span className="hidden text-sm text-light md:block">
									{formatDateAgo(lesson.createdAt)}
								</span>
							</div>
						</li>
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
	if(!lastEnrollment) {
		return <span className="text-sm text-light">Du bist momentan in keinem Kurs eingeschrieben.</span>;
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
