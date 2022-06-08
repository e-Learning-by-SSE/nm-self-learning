import { database } from "@self-learning/database";
import { ImageCard } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";
import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	InferGetServerSidePropsType
} from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";

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

export const getServerSideProps = async ({ req, res }: GetServerSidePropsContext) => {
	const session = await getSession({ req });

	if (!session?.user?.name) {
		return {
			redirect: {
				destination: "/login?callbackUrl=profile",
				permanent: false
			}
		};
	}

	const user = await getUser(session.user.name);

	const completedLessons = await database.student.findUnique({
		where: { username: user.username },
		select: {
			completedLessons: {
				skip: 0,
				take: 10,
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
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

export default function Profile({
	user,
	completedLessons
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<CenteredSection className="bg-gray-50">
				<div className="flex flex-col gap-16 lg:flex-row-reverse">
					<div className="flex flex-col place-items-center lg:place-items-start">
						<div className="relative h-[256px] w-[256px] rounded-lg bg-black"></div>
						<h1 className="mt-8 text-4xl">{user.displayName}</h1>

						<div className="mt-8 grid gap-1">
							<span className="text-light">Studiengang:</span>
							<span className="font-semibold text-secondary">
								Wirtschaftsinformatik, B. Sc.
							</span>
						</div>
					</div>

					<div className="flex grow flex-col rounded-lg bg-white p-8">
						<span className="mb-8 text-lg font-semibold ">Aktivität</span>

						<ul className="grid items-start">
							{completedLessons.data.map(lesson => (
								<Fragment key={lesson.createdAt as unknown as string}>
									<li className="flex grow flex-wrap items-center justify-between gap-2">
										<Link href={`/lessons/${lesson.lesson.slug}`}>
											<a className="text-sm hover:text-secondary">
												{lesson.lesson.title}
											</a>
										</Link>
										<span className="text-sm text-light">
											{toDateAgo(lesson.createdAt)}
										</span>
									</li>
									<span className="my-4 h-[1px] bg-light-border last:invisible last:my-0"></span>
								</Fragment>
							))}
						</ul>
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
