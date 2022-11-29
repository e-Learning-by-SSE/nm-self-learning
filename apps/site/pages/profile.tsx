/* eslint-disable @next/next/no-img-element */
import { database } from "@self-learning/database";
import { Defined, ResolvedValue } from "@self-learning/types";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getToken } from "next-auth/jwt";
import Link from "next/link";

type ProfileProps = {
	imgUrl: string | null;
	student: Defined<ResolvedValue<typeof getUser>["student"]>;
	completedLessons: {
		count: number;
		data: ResolvedValue<typeof getCompletedLessons>["completedLessons"];
	};
};

function getUser(username: string) {
	return database.user.findUniqueOrThrow({
		where: { name: username },
		select: {
			image: true,
			student: {
				select: {
					username: true,
					displayName: true,
					enrollments: {
						orderBy: { progress: "asc" },
						select: {
							status: true,
							createdAt: true,
							completedAt: true,
							progress: true,
							course: {
								select: {
									courseId: true,
									title: true,
									slug: true,
									subtitle: true,
									imgUrl: true,
									meta: true
								}
							}
						}
					}
				}
			}
		}
	});
}

async function getCompletedLessons(username: string) {
	return await database.student.findUnique({
		where: { username },
		select: {
			completedLessons: {
				skip: 0,
				take: 10,
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
					course: {
						select: {
							title: true,
							slug: true
						}
					},
					lesson: {
						select: {
							lessonId: true,
							title: true,
							slug: true
						}
					}
				}
			},
			_count: {
				select: {
					completedLessons: true
				}
			}
		}
	});
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({ req }) => {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

	if (!token?.name) {
		return {
			redirect: {
				destination: "/login?callbackUrl=profile",
				permanent: false
			}
		};
	}

	const [user, completedLessons] = await Promise.all([
		getUser(token.name),
		getCompletedLessons(token.name)
	]);

	const props = {
		imgUrl: user.image,
		student: user.student as Defined<typeof user.student>,
		completedLessons: {
			count: completedLessons?._count.completedLessons ?? 0,
			data: completedLessons?.completedLessons ?? []
		}
	};

	return {
		props: JSON.parse(JSON.stringify(props))
	} as GetServerSidePropsResult<typeof props>;
};

export default function Profile({ student, completedLessons, imgUrl }: ProfileProps) {
	return (
		<div className="flex flex-col bg-gray-50">
			<CenteredSection>
				<div className="flex flex-col-reverse gap-16 md:flex-row">
					<Activity completedLessons={completedLessons.data} />
					<StudentInfo student={student} imgUrl={imgUrl} />
				</div>
			</CenteredSection>

			<CenteredSection>
				<div className="flex flex-col gap-12">
					<h2 className="text-3xl">Meine Kurse</h2>

					{student.enrollments.length === 0 ? (
						<span className="text-sm text-light">
							Du bist momentan in keinem Kurs eingeschrieben.
						</span>
					) : (
						<ItemCardGrid>
							{student.enrollments.map(enrollment => (
								<Link
									key={enrollment.course.courseId}
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
				</div>
			</CenteredSection>
		</div>
	);
}

function toDateAgo(date: Date | string | number) {
	return formatDistance(new Date(date), Date.now(), {
		addSuffix: true,
		locale: de
	});
}

function StudentInfo({
	student,
	imgUrl
}: {
	imgUrl: ProfileProps["imgUrl"];
	student: ProfileProps["student"];
}) {
	return (
		<div className="flex flex-col place-items-center lg:place-items-start">
			<div className="relative h-[256px] w-[256px] rounded-lg bg-black">
				<img
					src={imgUrl ?? undefined}
					height={256}
					width={256}
					alt=""
					className="h-[256px] w-[256px] rounded-lg object-cover"
				></img>
			</div>
			<h1 className="mt-8 text-4xl">{student.displayName}</h1>

			<div className="mt-8 grid gap-1">
				<span className="text-light">Studiengang:</span>
				<span className="font-semibold text-secondary">Wirtschaftsinformatik, B. Sc.</span>
			</div>
		</div>
	);
}

function Activity({
	completedLessons
}: {
	completedLessons: ProfileProps["completedLessons"]["data"];
}) {
	return (
		<section className="flex w-full flex-col gap-4">
			<h2 className="mb-4 text-3xl">Meine Aktivität</h2>

			{completedLessons.length > 0 ? (
				<ul className="flex flex-col gap-2">
					{completedLessons.map(lesson => (
						<li
							key={lesson.createdAt as unknown as string}
							className="flex grow flex-wrap items-center justify-between gap-2 rounded-lg border border-light-border bg-white py-2 px-4"
						>
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
											className="text-secondary"
											href={`/courses/${lesson.course.slug}`}
										>
											{lesson.course.title}
										</Link>
									</span>
								)}
							</div>
							<span className="text-sm text-light">
								{toDateAgo(lesson.createdAt)}
							</span>
						</li>
					))}
				</ul>
			) : (
				<span className="text-sm text-light">
					Du hast bisher noch keine Lerneinheit abgeschlossen.
				</span>
			)}
		</section>
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
