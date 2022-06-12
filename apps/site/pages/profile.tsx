import { database } from "@self-learning/database";
import { ImageCard } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getToken } from "next-auth/jwt";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

type ProfileProps = {
	user: ResolvedValue<typeof getUser>;
	completedLessons: {
		count: number;
		data: ResolvedValue<typeof getCompletedLessons>["completedLessons"];
	};
};

function getUser(username: string) {
	return database.student.findUnique({
		rejectOnNotFound: true,
		where: { username },
		select: {
			username: true,
			displayName: true,
			enrollments: {
				select: {
					status: true,
					createdAt: true,
					completedAt: true,
					course: {
						select: {
							courseId: true,
							title: true,
							slug: true,
							subtitle: true,
							imgUrl: true
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
		<>
			<CenteredSection className="bg-gray-50">
				<div className="flex flex-col gap-16 lg:flex-row-reverse">
					<div className="flex flex-col place-items-center lg:place-items-start">
						<div className="relative h-[256px] w-[256px] rounded-lg bg-black">
							<Image
								src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
								height={256}
								width={256}
								alt=""
								className="rounded-lg object-cover object-top"
							></Image>
						</div>
						<h1 className="mt-8 text-4xl">{user.displayName}</h1>

						<div className="mt-8 grid gap-1">
							<span className="text-light">Studiengang:</span>
							<span className="font-semibold text-secondary">
								Wirtschaftsinformatik, B. Sc.
							</span>
						</div>
					</div>

					<div className="flex grow flex-col rounded-lg bg-white p-8">
						<span className="mb-4 text-lg font-semibold ">Aktivität</span>
						<Activity completedLessons={completedLessons.data} />
					</div>
				</div>
			</CenteredSection>

			<CenteredSection className="bg-white">
				<div className="flex flex-col gap-12">
					<h2 className="text-3xl">Aktuelle Kurse</h2>

					<ItemCardGrid>
						{user.enrollments.map(enrollment => (
							<Link
								key={enrollment.course.courseId}
								href={`/courses/${enrollment.course.slug}`}
							>
								<a>
									<ImageCard
										slug={enrollment.course.slug}
										title={enrollment.course.title}
										subtitle={
											"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Placeat sapiente laudantium inventore quia sed."
										}
										imgUrl={enrollment.course.imgUrl}
										footer={
											<div className="mt-4 flex flex-col">
												<span className="mx-auto font-semibold">
													50% bearbeitet
												</span>
												<div className="mt-2 h-3 rounded-lg bg-gray-200">
													<div
														className="h-3 rounded-lg bg-green-600"
														style={{ width: "50%" }}
													></div>
												</div>
											</div>
										}
									/>
								</a>
							</Link>
						))}
					</ItemCardGrid>
				</div>
			</CenteredSection>

			<CenteredSection className="bg-gray-50">
				<div className="flex flex-col gap-12">
					<h2 className="text-3xl">Abgeschlossene Kurse</h2>
					<ItemCardGrid>
						{user.enrollments.map(enrollment => (
							<div key={enrollment.course.courseId}>
								<ImageCard
									slug={enrollment.course.slug}
									title={enrollment.course.title}
									subtitle={
										"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Placeat sapiente laudantium inventore quia sed."
									}
									imgUrl={enrollment.course.imgUrl}
									footer={
										<div className="mt-4 flex flex-col">
											<span className="mx-auto font-semibold">
												100% bearbeitet
											</span>
											<div className="mt-2 h-3 rounded-lg bg-gray-200">
												<div
													className="h-3 rounded-lg bg-green-600"
													style={{ width: "100%" }}
												></div>
											</div>
										</div>
									}
								/>
							</div>
						))}
					</ItemCardGrid>
				</div>
			</CenteredSection>
		</>
	);
}

function toDateAgo(date: Date | string | number) {
	return formatDistance(new Date(date), Date.now(), {
		addSuffix: true,
		locale: de
	});
}

function Activity({
	completedLessons
}: {
	completedLessons: ProfileProps["completedLessons"]["data"];
}) {
	return (
		<>
			{completedLessons.length > 0 ? (
				<ul className="grid items-start">
					{completedLessons.map(lesson => (
						<Fragment key={lesson.createdAt as unknown as string}>
							<li className="flex grow flex-wrap items-center justify-between gap-2 rounded-lg">
								<div className="flex flex-col gap-1">
									<Link
										href={`/courses/${lesson.course?.slug}/lessons/${lesson.lesson.slug}`}
									>
										<a className="text-sm hover:text-secondary">
											{lesson.lesson.title}
										</a>
									</Link>
									{lesson.course && (
										<span className="pl-4 text-sm text-secondary ">
											in{" "}
											<Link href={`/courses/${lesson.course.slug}`}>
												<a className="hover:text-secondary">
													{lesson.course.title}
												</a>
											</Link>
										</span>
									)}
								</div>
								<span className="self-start text-sm text-light">
									{toDateAgo(lesson.createdAt)}
								</span>
							</li>
							<span className="my-4 h-[1px] bg-light-border last:invisible last:my-0"></span>
						</Fragment>
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
