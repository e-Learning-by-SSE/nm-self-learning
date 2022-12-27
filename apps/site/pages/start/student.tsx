import { database } from "@self-learning/database";
import { Divider, ImageOrPlaceholder, SectionHeader } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";

type Student = Awaited<ReturnType<typeof getStudent>>;

type Props = {
	student: Student;
};

export function getStudent(username: string) {
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

export default function StudentStart({ student }: Props) {
	return (
		<CenteredSection className="bg-gray-50 pb-32">
			<div className="flex flex-col gap-10">
				<section className="flex items-center">
					<ImageOrPlaceholder
						src={student.user.image ?? undefined}
						className="h-24 w-24 rounded-lg object-cover"
					/>
					<div className="flex flex-col gap-4 pl-8 pr-4">
						<h1 className="text-6xl">{student.user.name}</h1>
						<span>
							Du hast bereits{" "}
							<span className="mx-1 font-semibold text-secondary">
								{student._count.completedLessons}
							</span>{" "}
							{student._count.completedLessons === 1
								? "Lerneinheit"
								: "Lerneinheiten"}{" "}
							abgeschlossen.
						</span>
					</div>
				</section>

				<Divider />

				<section>
					<SectionHeader title="Kürzlich abgeschlossene Lerneinheiten" />
					<Activity completedLessons={student.completedLessons} />
				</section>

				<Divider />

				<section>
					<SectionHeader title="Meine Kurse" />
					<Enrollments enrollments={student.enrollments} />
				</section>
			</div>
		</CenteredSection>
	);
}

function Activity({ completedLessons }: { completedLessons: Student["completedLessons"] }) {
	return (
		<>
			{completedLessons.length > 0 ? (
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
			) : (
				<span className="text-sm text-light">
					Du hast bisher noch keine Lerneinheit abgeschlossen.
				</span>
			)}
		</>
	);
}

function Enrollments({ enrollments }: { enrollments: Student["enrollments"] }) {
	return (
		<>
			{enrollments.length === 0 ? (
				<span className="text-sm text-light">
					Du bist momentan in keinem Kurs eingeschrieben.
				</span>
			) : (
				<ItemCardGrid>
					{enrollments.map(enrollment => (
						<Link
							key={enrollment.course.slug}
							href={`/courses/${enrollment.course.slug}`}
						>
							<ImageCard
								slug={enrollment.course.slug}
								title={enrollment.course.title}
								subtitle={enrollment.course.subtitle}
								imgUrl={enrollment.course.imgUrl}
								badge={
									enrollment.status === "COMPLETED" ? (
										<ImageCardBadge
											className="bg-emerald-500 text-white"
											text="Abgeschlossen"
										/>
									) : (
										<></>
									)
								}
								footer={<ProgressFooter progress={enrollment.progress} />}
							/>
						</Link>
					))}
				</ItemCardGrid>
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
