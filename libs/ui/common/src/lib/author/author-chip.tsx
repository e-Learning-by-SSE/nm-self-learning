import Link from "next/link";

export type AuthorProps = { displayName: string; slug: string; imgUrl?: string | null };

export function AuthorChip({ displayName, slug, imgUrl }: AuthorProps) {
	return (
		<Link legacyBehavior href={`/authors/${slug}`}>
			<a
				className="flex items-center gap-4 rounded-lg border border-light-border bg-white pr-4 text-sm"
				data-testid="author"
			>
				<div className="h-12 w-12 rounded-l-lg bg-gray-100">
					{imgUrl && (
						<img src={imgUrl} alt={displayName} className="h-12 w-12 rounded-l-lg" />
					)}
				</div>

				<span className="font-medium">{displayName}</span>
			</a>
		</Link>
	);
}

export function AuthorsList({ authors }: { authors: AuthorProps[] }) {
	return (
		<div className="flex flex-wrap gap-2 md:gap-8">
			{authors?.map(author => (
				<AuthorChip
					key={author.slug}
					slug={author.slug}
					displayName={author.displayName}
					imgUrl={author.imgUrl}
				/>
			))}
		</div>
	);
}
