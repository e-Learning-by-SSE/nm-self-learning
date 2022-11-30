import { trpc } from "@self-learning/api-client";
import { LoadingBox } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function AuthorsPage() {
	useSession({ required: true });

	const [displayName, setDisplayName] = useState("");
	const { data: authors, isLoading } = trpc.author.getAll.useQuery();

	const filteredAuthors = useMemo(() => {
		if (!authors) return [];
		if (!displayName || displayName.length === 0) return authors;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return authors?.filter(author =>
			author.displayName.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, authors]);

	return (
		<CenteredSection>
			<h1 className="mb-16 text-5xl">Autoren</h1>

			<SearchField
				placeholder="Suche nach Autor"
				onChange={e => setDisplayName(e.target.value)}
			/>

			{isLoading ? (
				<LoadingBox />
			) : (
				<div className="light-border rounded-lg border-x border-b bg-white">
					<table className="w-full table-auto">
						<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
							<tr className="border-t">
								<th className="py-4 text-start text-sm font-semibold"></th>
								<th className="py-4 px-8 text-start text-sm font-semibold">Name</th>
								<th className="py-4 text-start text-sm font-semibold"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-light-border">
							{filteredAuthors.map(author => (
								<tr key={author.slug}>
									<td className="w-0 py-4 px-4 text-sm text-light">
										{author.imgUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={author.imgUrl ?? undefined}
												height={42}
												width={42}
												className="h-[42px] w-[42px] rounded-lg object-cover"
												alt={`Image of ${author.displayName}`}
											/>
										) : (
											<div className="h-[42px] w-[42px] rounded-lg bg-gray-200"></div>
										)}
									</td>
									<td className="py-4 px-8 text-sm font-medium">
										<Link
											className="text-sm font-medium hover:text-secondary"
											href={`/authors/${author.slug}`}
										>
											{author.displayName}
										</Link>
									</td>
									<td className="px-8">
										<div className="flex flex-wrap justify-end gap-4">
											<button className="btn-stroked">Editieren</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</CenteredSection>
	);
}
