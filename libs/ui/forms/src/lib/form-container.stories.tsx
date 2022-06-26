import { SectionHeader } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { ComponentMeta } from "@storybook/react";
import * as Form from "./form-container";
import { LabeledField } from "./labeled-field";

export default {
	component: Form.Container,
	title: "Forms/Containers"
} as ComponentMeta<typeof Form.Container>;

export const FormSection = () => (
	<div className="bg-gray-50 p-16">
		<CenteredContainer>
			<Form.SectionCard>
				<LabeledField label="Title">
					<input className="textfield" type="text" />
				</LabeledField>
				<LabeledField label="Slug">
					<input className="textfield" type="slug" />
				</LabeledField>
			</Form.SectionCard>
		</CenteredContainer>
	</div>
);

export const FormContainer = () => (
	<div className="bg-gray-50">
		<Form.Title title="Create Thing" button={<button className="btn-primary">Save</button>} />
		<CenteredContainer>
			<Form.Container>
				<section>
					<SectionHeader
						title="Basic Information"
						subtitle="This is a Form.SectionCard"
					/>

					<Form.SectionCard>
						<LabeledField label="Title">
							<input className="textfield" type="text" />
						</LabeledField>
						<LabeledField label="Slug">
							<input className="textfield" type="slug" />
						</LabeledField>
					</Form.SectionCard>
				</section>
				<section>
					<SectionHeader
						title="Basic Information"
						subtitle="This is a Form.SectionCard"
					/>

					<Form.SectionCard>
						<LabeledField label="Title">
							<input className="textfield" type="text" />
						</LabeledField>
						<LabeledField label="Slug">
							<input className="textfield" type="slug" />
						</LabeledField>
					</Form.SectionCard>
				</section>
				<section>
					<SectionHeader
						title="Basic Information"
						subtitle="This is a Form.SectionCard"
					/>

					<Form.SectionCard>
						<LabeledField label="Title">
							<input className="textfield" type="text" />
						</LabeledField>
						<LabeledField label="Slug">
							<input className="textfield" type="slug" />
						</LabeledField>
					</Form.SectionCard>
				</section>
			</Form.Container>
		</CenteredContainer>
	</div>
);

export const Custom_Form_Page_Title = () => (
	<div className="bg-gray-50">
		<Form.Title
			title={
				<>
					<span>Lerneinheit </span>
					<span className="text-secondary">Zusammenfassung</span>
					<span> editieren</span>
				</>
			}
			button={<button className="btn-primary">Save</button>}
		/>
	</div>
);
