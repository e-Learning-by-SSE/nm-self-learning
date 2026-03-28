import type { TreeNode } from "./tree-parser";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { NodeTypeCategory } from "./schema";

export function TreeEditor({
	tree,
	allowTextInputForParents,
	restrictNodeTypes,
	nodeTypeCategories,
	setTree,
	setInput
}: {
	tree: TreeNode;
	allowTextInputForParents: boolean;
	restrictNodeTypes: boolean;
	nodeTypeCategories: NodeTypeCategory[];
	setTree: (tree: TreeNode) => void;
	setInput: (text: string) => void;
}) {
	const updateTree = (newTree: TreeNode) => {
		function updateLeafStatus(node: TreeNode) {
			node.isLeaf = node.children.length === 0;
			node.children.forEach(updateLeafStatus); // Recursively update children
		}

		updateLeafStatus(newTree); // Ensure all nodes have correct `isLeaf` values
		setTree(newTree);
		setInput(serializeTree(newTree)); // Update text representation
	};

	const handleRename = (node: TreeNode, newName: string) => {
		node.value = newName;
		updateTree({ ...tree });
	};

	const handleAddChild = (node: TreeNode) => {
		if (node.children.length === 0) {
			// Keep parent value as is, just add a new child below
			node.children = [{ value: "Node", children: [] }];
		} else {
			node.children.push({ value: "Node", children: [] });
		}
		updateTree({ ...tree });
	};

	const handleDelete = (parent: TreeNode | null, node: TreeNode) => {
		if (!parent) return;
		parent.children = parent.children.filter(child => child !== node);
		updateTree({ ...tree });
	};

	const generateNodeId = (path: number[]) => `node-${path.join("-")}`;

	const renderNode = (node: TreeNode, parent: TreeNode | null = null, path: number[] = []) => {
		const nodeId = generateNodeId(path);

		return (
			<div
				key={`${nodeId}`}
				className="ml-4 pl-4 border-l-2 border-c-border-strong space-y-2 py-1"
			>
				<div className="flex items-center space-x-2 bg-c-surface-2 p-2 rounded-lg shadow-sm">
					{restrictNodeTypes && node.children.length === 0 ? (
						<select
							className="border rounded px-3 py-1 text-sm bg-white w-36"
							value={node.value}
							onChange={e => handleRename(node, e.target.value)}
							title="Select a node type"
						>
							<option value="Node" disabled>
								-- wählen --
							</option>
							{nodeTypeCategories.map(category => (
								<optgroup key={category.name} label={category.name}>
									{category.nodes.map(node => (
										<option key={node} value={node}>
											{node}
										</option>
									))}
								</optgroup>
							))}
						</select>
					) : (
						<input
							type="text"
							className="border rounded px-3 py-1 text-sm w-32 focus:ring-2 focus:ring-blue-400 outline-none"
							value={node.value}
							onChange={e => handleRename(node, e.target.value)}
							placeholder="Enter text..."
						/>
					)}

					<button
						onClick={() => handleAddChild(node)}
						className="p-1 bg-c-primary text-white rounded hover:bg-blue-600 transition-colors"
						aria-label="Add child node"
					>
						<PlusIcon className="h-4 w-4" />
					</button>

					{parent && (
						<button
							onClick={() => handleDelete(parent, node)}
							className="p-1 bg-c-danger text-white rounded hover:bg-c-danger-strong transition-colors"
							aria-label="Delete node"
						>
							<TrashIcon className="h-4 w-4" />
						</button>
					)}
				</div>

				{node.children.length > 0 && (
					<div className="space-y-1">
						{node.children.map((child, index) =>
							renderNode(child, node, [...path, index])
						)}
					</div>
				)}
			</div>
		);
	};

	return <div>{renderNode(tree, null, [])}</div>;
}

export function serializeTree(node: TreeNode): string {
	if (node.children.length === 0) {
		return `[${node.value}]`;
	}

	const childrenText = node.children.map(serializeTree).join(" ");

	return `[${node.value} ${childrenText}]`;
}
