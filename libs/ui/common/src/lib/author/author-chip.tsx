import Link from "next/link";
import { ImageOrPlaceholder } from "../image/image-placeholder";

export type AuthorProps = { displayName: string; slug: string; imgUrl?: string | null };

export function AuthorChip({ displayName, slug, imgUrl }: AuthorProps) {
	return (
		<Link
			href={`/authors/${slug}`}
			className="flex items-center gap-4 rounded-lg border border-c-border bg-white pr-4 text-sm"
			data-testid="author"
		>
			<ImageOrPlaceholder
				src={imgUrl ?? undefined}
				className="h-10 w-10 rounded-l-lg object-cover"
			/>
			<span className="font-medium">{displayName}</span>
		</Link>
	);
}

export function AuthorsList({ authors }: { authors: AuthorProps[] }) {
	return (
		<div className="flex flex-wrap gap-2 md:gap-4">
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
