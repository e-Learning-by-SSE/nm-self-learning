import * as Toc from "./table-of-contents";

export default {
	title: "Course/Table of Contents"
};

export const FullExample = () => (
	<div className="flex flex-col place-items-center rounded-lg bg-gray-50 p-16">
		<Toc.Section isCompleted={true} isRequired={true}>
			<Toc.SingleLesson slug="abc" title="Introduction" />
		</Toc.Section>
		<Toc.SectionConnector isCompleted={true} isRequired={true} />
		<Toc.Section isCompleted={false} isRequired={false}>
			<Toc.Chapter
				title="Chapter One"
				description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Et necessitatibus fugit veritatis id eos maxime tempore placeat sit fuga unde? Blanditiis aspernatur laborum mollitia fugit corporis sequi doloremque ducimus quia."
				lessons={[
					{
						slug: "a",
						title: "Lesson A",
						isCompleted: true
					},
					{
						slug: "b",
						title: "Lesson B",
						isCompleted: true
					},
					{
						slug: "c",
						title: "Lesson C",
						isCompleted: false
					},
					{
						slug: "d",
						title: "Lesson D",
						isCompleted: false
					},
					{
						slug: "e",
						title: "Lesson E",
						isCompleted: false
					}
				]}
			/>
		</Toc.Section>
		<Toc.SectionConnector isCompleted={false} isRequired={true} />
		<Toc.Section isCompleted={false} isRequired={true}>
			<Toc.NestedCourse
				title="A Nested Course"
				description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Et necessitatibus fugit veritatis id eos maxime tempore placeat sit fuga unde? Blanditiis aspernatur laborum mollitia fugit corporis sequi doloremque ducimus quia."
				slug="abc"
				course={{
					imgUrl: undefined,
					title: "Basic Mathematics",
					subtitle: "Two plus two is four, minus one that's three, quick maths."
				}}
			/>
		</Toc.Section>
	</div>
);

export const Section = () => (
	<div className="flex flex-col place-items-center rounded-lg bg-gray-50 p-16">
		<Toc.Section isCompleted={true} isRequired={false}>
			This section has been completed.
		</Toc.Section>
		<Toc.SectionConnector isCompleted={true} isRequired={true} />
		<Toc.Section isCompleted={false} isRequired={false}>
			This Section has not been completed.
		</Toc.Section>
		<Toc.SectionConnector isCompleted={false} isRequired={true} />
		<Toc.Section isCompleted={false} isRequired={false}>
			This Section has not been completed.
		</Toc.Section>
	</div>
);

export const SingleLesson = () => (
	<div className="flex flex-col gap-16 rounded-lg bg-gray-50 p-16">
		<Toc.Section isCompleted={false} isRequired={false}>
			<Toc.SingleLesson slug="abc" title="Introduction" />
		</Toc.Section>
	</div>
);

export const Chapter = () => (
	<div className="flex flex-col gap-16 rounded-lg bg-gray-50 p-16">
		<Toc.Section isCompleted={false} isRequired={false}>
			<Toc.Chapter
				title="Chapter One"
				description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Et necessitatibus fugit veritatis id eos maxime tempore placeat sit fuga unde? Blanditiis aspernatur laborum mollitia fugit corporis sequi doloremque ducimus quia."
				lessons={[
					{
						slug: "a",
						title: "Lesson A",
						isCompleted: true
					},
					{
						slug: "b",
						title: "Lesson B",
						isCompleted: true
					},
					{
						slug: "c",
						title: "Lesson C",
						isCompleted: false
					},
					{
						slug: "d",
						title: "Lesson D",
						isCompleted: false
					},
					{
						slug: "e",
						title: "Lesson E",
						isCompleted: false
					}
				]}
			/>
		</Toc.Section>
	</div>
);

export const NestedCourse = () => (
	<div className="flex flex-col gap-16 rounded-lg bg-gray-50 p-16">
		<Toc.Section isCompleted={false} isRequired={false}>
			<Toc.NestedCourse
				title="A Nested Course"
				description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Et necessitatibus fugit veritatis id eos maxime tempore placeat sit fuga unde? Blanditiis aspernatur laborum mollitia fugit corporis sequi doloremque ducimus quia."
				slug="abc"
				course={{
					imgUrl: undefined,
					title: "Basic Mathematics",
					subtitle: "Two plus two is four, minus one that's three, quick maths."
				}}
			/>
		</Toc.Section>
	</div>
);
