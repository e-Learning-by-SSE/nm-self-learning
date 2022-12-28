import { authOptions } from "@self-learning/api";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";

// Moved into /components folder, because there is no suitable library for this yet
import AuthorOverview, { getAuthor } from "../../components/overview/author";
import StudentOverview, { getStudent } from "../../components/overview/student";

// Ideally, this should be implemented using a middleware with a rewrite
// - /start -> /start/author (if user is author)
// - /start -> /start/student
// Unfortunately, this is not possible at the moment, because we do not have database access in the middleware function

type Props =
	| { type: "student"; student: Awaited<ReturnType<typeof getStudent>> }
	| { type: "author"; author: Awaited<ReturnType<typeof getAuthor>> };

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

	if (session.user.isAuthor) {
		return {
			props: {
				type: "author",
				author: await getAuthor(session.user.name)
			}
		};
	}

	return {
		props: {
			type: "student",
			student: JSON.parse(JSON.stringify(await getStudent(session.user.name))) // using parse to deal with date type :(
		}
	};
};

export default function Start(props: Props) {
	if (props.type === "author") {
		return <AuthorOverview author={props.author} />;
	}

	return <StudentOverview student={props.student} />;
}
