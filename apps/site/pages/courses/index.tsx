import { XIcon } from "@heroicons/react/solid";
import { CenteredContainer, SidebarLayout } from "@self-learning/ui/layouts";
import Image from "next/image";
import Link from "next/link";
import { connectHits, connectSearchBox } from "react-instantsearch-dom";

// const searchClient = algoliasearch(
// 	process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID ?? "",
// 	process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? ""
// );

type NanomoduleHit = {
	objectID: string;
	title: string;
	subtitle: string;
	description: string;
	image?: {
		url: string;
		alternativeText?: string;
	};
	authors: [
		{
			name: string;
		}
	];
};

export default function Courses() {
	return (
		<SidebarLayout>
			<CenteredContainer defaultPadding={true}>
				<div className="flex flex-col">
					<h1 className="mb-8 text-3xl">Empfohlene Kurse</h1>
					<div className="flex flex-wrap gap-4">
						<Link href="/courses/the-example-course">
							<a className="rounded bg-slate-100 p-4">
								<span className="font-semibold">The Example Course</span>
							</a>
						</Link>
					</div>
				</div>

				<h2 className="mt-16 mb-4 text-2xl">Suche nach Lerninhalten</h2>
				<div className="flex flex-col">
					{/* <InstantSearch searchClient={searchClient} indexName="development_nanomodules">
					<CustomSearchBox />
					<CustomHits />
				</InstantSearch> */}
				</div>
			</CenteredContainer>
		</SidebarLayout>
	);
}

const NanomoduleHit = ({ hit }: { hit: NanomoduleHit }) => {
	return (
		<div className="flex flex-col rounded">
			<div className="relative h-48">
				{hit.image ? (
					<Image
						className="rounded-t"
						src={`http://localhost:1337${hit.image.url}`}
						objectFit="cover"
						layout="fill"
						alt={hit.image.alternativeText}
					></Image>
				) : (
					<div className="h-full w-full rounded-t bg-gradient-to-br from-emerald-500 to-emerald-300"></div>
				)}
			</div>

			<div className="flex h-full flex-col gap-4 rounded bg-gray-50 p-4 shadow-lg">
				<h2 className="text-xl">{hit.title}</h2>
				{hit.subtitle && <h3 className="text-slate-600">{hit.subtitle}</h3>}
				<p className="text-sm text-slate-500">{hit.description}</p>
			</div>
		</div>
	);
};

const NanomoduleList = ({ hits }: { hits: NanomoduleHit[] }) => {
	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
			{hits.map(hit => (
				<NanomoduleHit key={hit.objectID} hit={hit}></NanomoduleHit>
			))}
		</div>
	);
};

const CustomHits = connectHits(NanomoduleList);

const SearchBox = ({ currentRefinement, isSearchStalled, refine }: any) => (
	<form noValidate action="" role="search">
		<div className="relative">
			<input
				className="relative mb-8 block w-full rounded border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
				placeholder="Suche nach einem Thema..."
				type="search"
				value={currentRefinement}
				onChange={event => refine(event.currentTarget.value)}
			/>
			<button className="absolute right-3 top-3" title="Clear" onClick={() => refine("")}>
				<XIcon className="h-4" />
			</button>
		</div>

		{isSearchStalled ? "My search is stalled" : ""}
	</form>
);

const CustomSearchBox = connectSearchBox(SearchBox);
