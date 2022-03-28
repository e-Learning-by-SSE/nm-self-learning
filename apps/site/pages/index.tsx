import type { User } from "@prisma/client";
import { database } from "@self-learning/database";
import { GetStaticProps } from "next";

type IndexPageProps = {
	users: User[];
};

export const getStaticProps: GetStaticProps<IndexPageProps> = async ({ params }) => {
	const users = await database.user.findMany();
	return {
		props: { users }
	};
};

export function Index({ users }: IndexPageProps) {
	return (
		<div className="flex items-center justify-center h-full flex-col gap-16">
			<h1 className="font-bold text-4xl">Hello World</h1>
			<ul>
				{users.map(user => (
					<li key={user.id} className="font-bold ">
						{user.displayName}
					</li>
				))}
			</ul>
		</div>
	);
}

export default Index;
