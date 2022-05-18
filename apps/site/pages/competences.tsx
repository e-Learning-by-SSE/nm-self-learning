import { createCompetence, deleteCompetence, getCompetences } from "@self-learning/cms-api";
import { CenteredSection } from "@self-learning/ui/layouts";
import { InferGetStaticPropsType } from "next";
import { useMutation, useQuery, useQueryClient } from "react-query";

type Competences = ResolvedValue<typeof getCompetences>;

export const getStaticProps = async () => {
	const competences = await getCompetences();
	return {
		props: { competences }
	};
};

const queryKey = ["competences"];

function useCompetencesMutations() {
	const queryClient = useQueryClient();

	const { mutate: deleteCompetenceMutation } = useMutation(
		(id: string) => {
			return deleteCompetence(id);
		},
		{
			// onMutate: id => {
			// 	const snapshot = queryClient.getQueryData(["competences"]);
			// 	queryClient.setQueryData(["competences"], old =>
			// 		(old as Competences)?.filter(c => c._id !== id)
			// 	);
			// 	return { snapshot };
			// },
			onSettled: (data, error, vars, context) => {
				if (error) {
					console.log(error);
					queryClient.setQueryData(queryKey, (context as any).snapshot);
				}

				queryClient.invalidateQueries(["competences"]);
			}
		}
	);

	const { mutate: addCompetenceMutation } = useMutation(
		(vars: { title: string; description?: string }) => {
			return createCompetence({
				title: vars.title,
				description: vars.description
			});
		},
		{
			// onMutate: ({ title, description }) => {
			// 	const previous = queryClient.getQueryData(["competences"]);
			// 	queryClient.setQueryData(["competences"], old => [
			// 		...(old as []),
			// 		{ title, description }
			// 	]);
			// 	return previous;
			// },
			onSettled: (data, error) => {
				if (error) {
					console.log(error);
				}

				queryClient.invalidateQueries(["competences"]);
			}
		}
	);

	return { addCompetenceMutation, deleteCompetenceMutation };
}

export default function Competences({
	competences
}: InferGetStaticPropsType<typeof getStaticProps>) {
	const { data: _competences } = useQuery(["competences"], getCompetences, {
		initialData: competences
	});

	const { addCompetenceMutation, deleteCompetenceMutation } = useCompetencesMutations();

	const handleSubmit = async (event: any) => {
		event.preventDefault();

		console.log(event.target.competence.value);
		console.log(event.target.description.value);

		addCompetenceMutation({
			title: event.target.competence.value,
			description: event.target.description.value
		});
	};

	return (
		<div className="min-h-screen">
			<CenteredSection className="gradient">
				<div className="grid gap-4">
					<h1 className="text-6xl">Competences</h1>
					<h1 className="ml-32 text-6xl text-slate-600">Competences</h1>
					<h1 className="ml-64 text-6xl text-slate-50">Competences</h1>
				</div>
			</CenteredSection>

			<CenteredSection className=" bg-gray-50">
				<div className="grid grid-cols-2 items-start gap-32">
					<div className="grid items-start gap-4">
						{_competences?.map(comp => (
							<div
								key={comp.competenceId}
								className="relative rounded-lg border border-indigo-200 p-4 text-xs"
							>
								<button
									className="absolute right-4 text-red-500"
									onClick={() => deleteCompetenceMutation(comp._id as string)}
								>
									Delete
								</button>
								<pre>{JSON.stringify(comp, null, 4)}</pre>
							</div>
						))}
					</div>

					<form className="grid items-start gap-16" onSubmit={handleSubmit}>
						<div className="grid gap-2">
							<label
								htmlFor="competence"
								className="font-semibold group-focus-within:text-indigo-500 group-focus:text-indigo-600"
							>
								Kompetenz
							</label>
							<input
								type="text"
								name="competence"
								placeholder="Kompetenz"
								autoComplete="off"
								className="rounded-lg border-indigo-200 py-3 placeholder:text-slate-300 focus:border-indigo-500"
							/>
						</div>

						<div className="grid gap-2">
							<label htmlFor="description" className="font-semibold">
								Beschreibung
							</label>
							<textarea
								name="description"
								placeholder="Beschreibung"
								rows={5}
								className="rounded-lg border-indigo-200 py-3 placeholder:text-slate-300 focus:border-indigo-500"
							/>
						</div>

						<button type="submit" className="btn-primary w-fit">
							Erstellen
						</button>
					</form>
				</div>
			</CenteredSection>
		</div>
	);
}
