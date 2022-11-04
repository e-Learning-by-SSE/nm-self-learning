/* eslint-disable @next/next/no-img-element */
import { database } from "@self-learning/database";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getToken } from "next-auth/jwt";
import Link from "next/link";

type ProfileProps = {
	user: ResolvedValue<typeof getUser>;
	completedLessons: {
		count: number;
		data: ResolvedValue<typeof getCompletedLessons>["completedLessons"];
	};
};

function getUser(username: string) {
	return database.student.findUniqueOrThrow({
		where: { username },
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
		user: user as Exclude<typeof user, null>,
		completedLessons: {
			count: completedLessons?._count.completedLessons ?? 0,
			data: completedLessons?.completedLessons ?? []
		}
	};

	return {
		props: JSON.parse(JSON.stringify(props))
	} as GetServerSidePropsResult<typeof props>;
};

export default function Profile({ user, completedLessons }: ProfileProps) {
	return (
		<div className="flex flex-col bg-gray-50">
			<CenteredSection>
				<div className="flex flex-col-reverse gap-16 md:flex-row">
					<Activity completedLessons={completedLessons.data} />
					<StudentInfo user={user} />
				</div>
			</CenteredSection>

			<CenteredSection>
				<div className="flex flex-col gap-12">
					<h2 className="text-3xl">Meine Kurse</h2>

					<ItemCardGrid>
						{user.enrollments.map(enrollment => (
							<Link
								legacyBehavior
								key={enrollment.course.courseId}
								href={`/courses/${enrollment.course.slug}`}
							>
								<a>
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
								</a>
							</Link>
						))}
					</ItemCardGrid>
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

function StudentInfo({ user }: { user: ProfileProps["user"] }) {
	return (
		<div className="flex flex-col place-items-center lg:place-items-start">
			<div className="relative h-[256px] w-[256px] rounded-lg bg-black">
				<img
					src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
					height={256}
					width={256}
					alt=""
					className="h-[256px] w-[256px] rounded-lg object-cover object-top"
				></img>
			</div>
			<h1 className="mt-8 text-4xl">{user.displayName}</h1>

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
									legacyBehavior
									href={`/courses/${lesson.course?.slug}/${lesson.lesson.slug}`}
								>
									<a className="text-sm font-medium hover:text-secondary">
										{lesson.lesson.title}
									</a>
								</Link>
								{lesson.course && (
									<span className="text-xs text-light">
										in{" "}
										<Link
											legacyBehavior
											href={`/courses/${lesson.course.slug}`}
										>
											<a className="text-secondary">{lesson.course.title}</a>
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
