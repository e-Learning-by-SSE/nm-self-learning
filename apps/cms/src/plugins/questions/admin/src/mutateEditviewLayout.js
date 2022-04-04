// see https://www.youtube.com/watch?v=55KJ2sCX8ws

const customType = "questions-json";

const mutateLayout = layout => {
	return layout.map(row => {
		const mutateRow = row.reduce((acc, field) => {
			const hasCustomFieldEnabled = field.fieldSchema.pluginOptions?.[customType]?.enabled;

			if (!hasCustomFieldEnabled) return [...acc, field];

			return [...acc, { ...field, fieldSchema: { ...field.fieldSchema, type: customType } }];
		}, []);

		return mutateRow;
	});
};

const mutateEditViewHook = ({ layout, query }) => {
	const mutatedEditLayout = mutateLayout(layout.contentType.layouts.edit);
	const enhancedLayouts = {
		...layout.contentType.layouts,
		edit: mutatedEditLayout
	};

	return {
		query,
		layout: {
			...layout,
			contentType: {
				...layout.contentType,
				layouts: enhancedLayouts
			}
		}
	};
};

export default mutateEditViewHook;
