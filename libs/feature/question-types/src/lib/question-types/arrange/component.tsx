import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { MarkdownViewer } from "@self-learning/ui/forms";
import { Fragment } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";

export default function ArrangeQuestion() {
	const { answer, setAnswer, evaluation, question } = useQuestion("arrange");
	const order = question.categoryOrder;

	return (
		<>
			<DragDropContext
				onDragEnd={result => {
					console.log(result);
					const { source, destination } = result;

					if (!destination) return;

					setAnswer(prev => {
						const value = { ...prev.value };
						const [removed] = value[source.droppableId].splice(source.index, 1);
						value[destination.droppableId].splice(destination.index, 0, removed);
						return { type: "arrange", value };
					});
				}}
			>
				<div className="grid auto-rows-fr gap-4 grid-flow-row xl:grid-flow-col">
					{order
						.filter(containerId => containerId !== "_init")
						.map(containerId => (
							// eslint-disable-next-line react/jsx-no-useless-fragment
							<Fragment key={containerId}>
								{containerId === "_init" ? null : (
									<ul
										key={containerId}
										className="flex min-w-[256px] flex-col gap-4 rounded-lg bg-gray-200 p-4"
									>
										<span className="font-semibold">{containerId}</span>

										<Droppable
											droppableId={containerId.toString()}
											isDropDisabled={!!evaluation}
										>
											{provided => (
												<ul
													ref={provided.innerRef}
													{...provided.droppableProps}
													className="flex min-w-fit flex-col gap-4 rounded-lg bg-gray-100 p-4"
												>
													{answer.value[containerId]?.map(
														(item, index) => (
															<Draggable
																key={item.id}
																draggableId={item.id}
																index={index}
																isDragDisabled={!!evaluation}
															>
																{provided => (
																	<li
																		ref={provided.innerRef}
																		{...provided.draggableProps}
																		{...provided.dragHandleProps}
																		className="h-fit w-fit max-w-[50ch] rounded-lg bg-white p-4 shadow-lg"
																	>
																		<MarkdownViewer
																			content={item.content}
																		/>
																	</li>
																)}
															</Draggable>
														)
													)}
													{provided.placeholder}
												</ul>
											)}
										</Droppable>
									</ul>
								)}
							</Fragment>
						))}
				</div>

				<div className="flex min-h-[128px] flex-col gap-4 rounded-lg bg-gray-200 p-4">
					<span className="font-semibold">Nicht zugeordnet</span>

					<Droppable
						droppableId={"_init"}
						direction="horizontal"
						isDropDisabled={!!evaluation}
					>
						{provided => (
							<ul
								ref={provided.innerRef}
								{...provided.droppableProps}
								className="flex min-h-[128px] flex-wrap gap-4 rounded-lg border-white bg-gray-100 p-4"
							>
								{answer.value["_init"].map((item, index) => (
									<Draggable
										key={item.id}
										draggableId={item.id}
										index={index}
										isDragDisabled={!!evaluation}
									>
										{provided => (
											<li
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												className="h-fit w-fit max-w-[50ch] rounded-lg bg-white p-4 shadow-lg"
											>
												<MarkdownViewer content={item.content} />
											</li>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</ul>
						)}
					</Droppable>
				</div>
			</DragDropContext>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<ul className="flex flex-col gap-2">
						{Object.entries(evaluation.feedback).map(([containerId, feedback]) => (
							<li key={containerId} className="flex flex-col">
								{feedback.isCorrect ? (
									<span className="font-semibold">{containerId}: OK</span>
								) : (
									<>
										<span className="font-semibold">{containerId}:</span>
										<span className="pl-4">
											Fehlende Elemente: {feedback.missing.length}
										</span>
										<span className="pl-4">
											Falsche Elemente: {feedback.extra.length}
										</span>
									</>
								)}
							</li>
						))}
					</ul>
				</Feedback>
			)}
		</>
	);
}
