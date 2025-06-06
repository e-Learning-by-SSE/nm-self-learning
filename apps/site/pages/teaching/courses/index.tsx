import { zodResolver } from "@hookform/resolvers/zod";
import { authOptions } from "@self-learning/api";
import {
	createEmptyExtendedCourseFormModel,
	ExtendedCourseFormModel,
	extendedCourseFormSchema
} from "@self-learning/teaching";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import {
	CourseBasicInformation,
	CourseSkillView,
	CourseModulView,
	CoursePreview
} from "@self-learning/ui/course";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export const getServerSideProps: GetServerSideProps = async ctx => {
	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	if (session.user.role !== "ADMIN" && !session.user.isAuthor) {
		return {
			redirect: {
				destination: "/403",
				permanent: false
			}
		};
	}

	return {
		props: {}
	};
};

const course = createEmptyExtendedCourseFormModel();

export default function CourseCreationEditor({
	onConfirm
}: {
	onConfirm: (course: ExtendedCourseFormModel) => void;
}) {
	const tabs = ["1. Grunddaten", "2. Skillansicht", "3. Modulansicht", "4. Vorschau"];
	const [selectedIndex, setSelectedIndex] = useState(0);

	function switchTab(index: number) {
		setSelectedIndex(index);
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <CourseBasicInformation />;
			case 1:
				return <CourseSkillView />;
			case 2:
				return <CourseModulView />;
			case 3:
				return <CoursePreview />;
			default:
				return null;
		}
	};

	const form = useForm<ExtendedCourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(extendedCourseFormSchema)
	});

	return (
		/*
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((content, idx) => (
					<Tab key={idx}>{content}</Tab>
				))}
			</Tabs>
			<div>{renderContent(selectedIndex)}</div>
		</div>
*/
		<>
			<FormProvider {...form}>
				<form
					id="courseform"
					onSubmit={e => {
						if ((e.target as unknown as { id: string }).id === "courseform") {
							form.handleSubmit(
								data => {
									console.log("data", data);
									try {
										const validated = extendedCourseFormSchema.parse(data);
										onConfirm(validated);
									} catch (error) {
										console.error(error);
									}
								},
								invalid => {
									console.log("invalid", invalid);
								}
							)(e);
						}
					}}
				>
					<div className="m-3">
						<section>
							<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
						</section>
						<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
							{tabs.map((content, idx) => (
								<Tab key={idx}>{content}</Tab>
							))}
						</Tabs>
						<div>{renderContent(selectedIndex)}</div>
					</div>
				</form>
			</FormProvider>
		</>
	);
}
