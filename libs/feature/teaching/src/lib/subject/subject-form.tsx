import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { SpecializationRelation } from "@self-learning/types";
import { IconButton, ImageChip, OnDialogCloseFn, showToast } from "@self-learning/ui/common";
import { Form } from "@self-learning/ui/forms";
import Link from "next/link";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { SpecializationSelector } from "../subject/subject-selector";

export function SpecializationForm({ subtitle }: { subtitle: string }) {
	const [openDialog, setOpenAddDialog] = useState(false);
	const { control } = useFormContext<{ specializations: SpecializationRelation }>();
	const {
		fields: specializations,
		append,
		remove
	} = useFieldArray({
		control,
		name: "specializations"
	});

	const handleAdd: OnDialogCloseFn<{ specializationId: string; title: string }> = result => {
		if (result) {
			if (specializations.find(s => s.specializationId === result.specializationId)) {
				showToast({
					type: "warning",
					title: "Spezialisierung bereits vorhanden",
					subtitle: result.title
				});
				return;
			}

			append({ specializationId: result.specializationId });
		}
		setOpenAddDialog(false);
	};

	function handleRemove(index: number) {
		window.confirm("Spezialisierung entfernen?") && remove(index);
	}

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Spezialisierungen" subtitle={subtitle} />

			<IconButton
				type="button"
				data-testid="author-add"
				onClick={() => setOpenAddDialog(true)}
				title="Hinzufügen"
				text="Hinzufügen"
				icon={<PlusIcon className="h-5" />}
			/>

			<ul className="grid gap-4">
				{specializations.map(({ specializationId }, index) => (
					<Specialization
						key={specializationId}
						specializationId={specializationId}
						onRemove={() => handleRemove(index)}
					/>
				))}
			</ul>

			{openDialog && <SpecializationSelector open={openDialog} onClose={handleAdd} />}
		</Form.SidebarSection>
	);
}

function Specialization({
	specializationId,
	onRemove
}: {
	specializationId: string;
	onRemove: () => void;
}) {
	const { data: specialization } = trpc.specialization.getById.useQuery({ specializationId });

	if (!specialization) {
		return <li className="rounded-lg border border-light-border bg-white p-2">Loading...</li>;
	}

	return (
		<ImageChip imgUrl={specialization.cardImgUrl} onRemove={onRemove}>
			<span className="text-xs text-light">{specialization.subject.title}</span>
			<Link
				href={`/subjects/${specialization.subject.slug}/${specialization.slug}`}
				target="_blank"
				className="font-medium hover:text-secondary"
				rel="noopener noreferrer"
			>
				{specialization.title}
			</Link>
		</ImageChip>
	);
}
