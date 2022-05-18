import { database } from "@self-learning/database";
import { ImageCard } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	InferGetServerSidePropsType
} from "next";
import Link from "next/link";

export const getServerSideProps = async ({ req }: GetServerSidePropsContext) => {
	const user = await database.user.findUnique({
		rejectOnNotFound: true,
		where: { username: "potter" },
		select: {
			username: true,
			displayName: true,
			competences: true,
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

	return {
		props: { user: JSON.parse(JSON.stringify(user)) }
	} as GetServerSidePropsResult<{ user: typeof user }>;
};

export default function Profile({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<div className="min-h-screen pb-16">
			<CenteredSection className="gradient">
				<div className="flex flex-col place-items-center gap-16">
					<div className="relative h-[256px] w-[256px] rounded-lg bg-black"></div>
					<h1 className="text-6xl">{user.displayName}</h1>
				</div>
			</CenteredSection>

			<CenteredSection className="bg-gray-50">
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

			<CenteredSection className="bg-white">
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
		</div>
	);
}
