import { CogIcon, PencilIcon, PlusIcon } from "@heroicons/react/solid";
import { authOptions } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import {
	Divider,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { formatDateAgo } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentProps, useState } from "react";
import { ReactComponent as VoidSvg } from "../../svg/void.svg";

const EditAuthorDialog = dynamic(
	() => import("@self-learning/teaching").then(m => m.EditAuthorDialog),
	{ ssr: false }
);

async function getAuthor(username: string) {
	return await database.author.findUniqueOrThrow({
		where: { username },
		select: {
			slug: true,
			displayName: true,
			imgUrl: true,
			subjectAdmin: {
				orderBy: { subject: { title: "asc" } },
				select: {
					subject: {
						select: {
							subjectId: true,
							title: true,
							cardImgUrl: true
						}
					}
				}
			},
			specializationAdmin: {
				orderBy: { specialization: { title: "asc" } },
				select: {
					specialization: {
						select: {
							specializationId: true,
							title: true,
							cardImgUrl: true,
							subject: {
								select: {
									subjectId: true,
									title: true
								}
							}
						}
					}
				}
			},
			courses: {
				orderBy: { title: "asc" },
				select: {
					courseId: true,
					slug: true,
					title: true,
					imgUrl: true,
					specializations: {
						select: {
							title: true
						}
					}
				}
			}
		}
	});
}

type Author = Awaited<ReturnType<typeof getAuthor>>;

type Props = {
	author: Author;
};

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	const author = await getAuthor(session.user.name);

	return {
		props: { author }
	};
};

export default function AuthorStart({ author }: Props) {
	const session = useRequiredSession();
	const authorSlug = session.data?.user.author?.slug;
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const { mutateAsync: updateAuthor } = trpc.author.updateSelf.useMutation();
	const router = useRouter();

	const onEditDialogClose: ComponentProps<
		typeof EditAuthorDialog
	>["onClose"] = async editedAuthor => {
		setOpenEditDialog(false);

		if (editedAuthor) {
			try {
				await updateAuthor(editedAuthor);
				showToast({
					type: "success",
					title: "Informationen aktualisiert",
					subtitle: "Bitte führe einen erneuten Login durch."
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
		<CenteredSection className="bg-gray-50">
			<div className="flex flex-col gap-10">
				<section className="flex">
					<ImageOrPlaceholder
						src={author.imgUrl ?? undefined}
						className="h-24 w-24 rounded-lg object-cover"
					/>
					<div className="flex flex-col pl-8 pr-4">
						<h1 className="text-6xl">{author.displayName}</h1>
						<div className="flex items-center gap-4">
							<Link
								href={`/authors/${author.slug}`}
								className="font-medium text-secondary hover:underline"
							>
								/{author.slug}
							</Link>
							<button
								className="h-fit w-fit rounded-full p-2 hover:bg-gray-200"
								title="Bearbeiten"
								onClick={() => setOpenEditDialog(true)}
							>
								<CogIcon className="h-5 justify-self-start text-gray-400" />
							</button>

							{openEditDialog && (
								<EditAuthorDialog author={author} onClose={onEditDialogClose} />
							)}
						</div>
					</div>
				</section>

				{author.subjectAdmin.length > 0 && (
					<>
						<Divider />

						<section>
							<SectionHeader
								title="Fachgebiete"
								subtitle="Administrator in den folgenden Fachgebieten:"
							/>

							<ul className="flex flex-wrap gap-4">
								{author.subjectAdmin.map(({ subject }) => (
									<Chip
										key={subject.subjectId}
										href={`/teaching/subjects/${subject.subjectId}`}
										title={subject.title}
										imgUrl={subject.cardImgUrl}
									/>
								))}
							</ul>
						</section>
					</>
				)}

				{author.subjectAdmin.length > 0 && (
					<>
						<Divider />
						<section>
							<SectionHeader
								title="Spezialisierungen"
								subtitle="Administrator in den folgenden Spezialisierungen:"
							/>

							<ul className="flex flex-wrap gap-4">
								{author.specializationAdmin.map(({ specialization }) => (
									<Chip
										key={specialization.specializationId}
										href={`/teaching/subjects/${specialization.subject.subjectId}/${specialization.specializationId}`}
										title={specialization.title}
										imgUrl={specialization.cardImgUrl}
									/>
								))}
							</ul>
						</section>
					</>
				)}

				<Divider />

				<section>
					<div className="flex justify-between gap-4">
						<SectionHeader
							title="Meine Kurse"
							subtitle="Autor in den folgenden Kursen:"
						/>

						<Link href="/teaching/courses/create" className="btn-primary h-fit w-fit">
							<PlusIcon className="icon" />
							<span>Neuen Kurs erstellen</span>
						</Link>
					</div>

					<ul className="flex flex-col gap-4 py-4">
						{author.courses.length === 0 ? (
							<div className="mx-auto flex items-center gap-8">
								<div className="h-32 w-32">
									<VoidSvg />
								</div>
								<p className="text-light">Du hast noch keine Kurse erstellt.</p>
							</div>
						) : (
							author.courses.map(course => (
								<li
									key={course.courseId}
									className="flex items-center rounded-lg border border-light-border bg-white"
								>
									<ImageOrPlaceholder
										src={course.imgUrl ?? undefined}
										className="h-16 w-16 rounded-l-lg object-cover"
									/>

									<div className="flex w-full items-center justify-between px-4">
										<div className="flex flex-col gap-1">
											<span className="text-xs text-light">
												{course.specializations
													.map(s => s.title)
													.join(" | ")}
											</span>
											<Link
												href={`/courses/${course.slug}`}
												className="text-sm font-medium"
											>
												{course.title}
											</Link>
										</div>

										<Link
											href={`/teaching/courses/edit/${course.courseId}`}
											className="btn-stroked h-fit w-fit"
										>
											<PencilIcon className="icon" />
											<span>Bearbeiten</span>
										</Link>
									</div>
								</li>
							))
						)}
					</ul>
				</section>

				<Divider />

				<section>
					<SectionHeader
						title="Meine Lerneinheiten"
						subtitle="Autor der folgenden Lerneinheiten:"
					/>

					{authorSlug && <Lessons authorSlug={authorSlug} />}
				</section>
			</div>
		</CenteredSection>
	);
}

function Lessons({ authorSlug }: { authorSlug: string }) {
	const router = useRouter();
	const { title = "", page = 1 } = router.query;

	const { data: lessons } = trpc.lesson.findMany.useQuery(
		{
			page: Number(page),
			title: title as string,
			authorSlug
		},
		{
			keepPreviousData: true,
			staleTime: 10_000
		}
	);

	return (
		<div className="flex min-h-[500px] flex-col">
			{!lessons ? (
				<LoadingBox />
			) : (
				<>
					<SearchField
						placeholder="Suche nach Lerneinheit"
						value={title}
						onChange={e => {
							router.push(
								{
									query: {
										title: e.target.value,
										page: 1
									}
								},
								undefined,
								{ shallow: true }
							);
						}}
					/>

					<Table
						head={
							<>
								<TableHeaderColumn>Titel</TableHeaderColumn>
								<TableHeaderColumn>Letzte Änderung</TableHeaderColumn>
							</>
						}
					>
						{lessons.result.map(lesson => (
							<tr key={lesson.lessonId}>
								<TableDataColumn>
									<Link
										href={`/teaching/lessons/edit/${lesson.lessonId}`}
										className="font-medium hover:text-secondary"
									>
										{lesson.title}
									</Link>
								</TableDataColumn>
								<TableDataColumn>
									<span className="text-light">
										{formatDateAgo(lesson.updatedAt)}
									</span>
								</TableDataColumn>
							</tr>
						))}
					</Table>

					<Paginator pagination={lessons} url={`${router.route}?title=${title}`} />
				</>
			)}
		</div>
	);
}

function Chip({ title, href, imgUrl }: { href: string; title: string; imgUrl?: string | null }) {
	return (
		<Link href={href} className="flex w-fit rounded-lg border border-light-border bg-white">
			<ImageOrPlaceholder
				src={imgUrl ?? undefined}
				className="h-10 w-10 rounded-l-lg object-cover"
			/>
			<span className="my-auto px-4 text-sm font-medium">{title}</span>
		</Link>
	);
}
