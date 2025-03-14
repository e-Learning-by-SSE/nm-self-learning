import type { TreeNode } from "./tree-parser";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const phraseOptions = ["NP", "PP", "S", "ADJP", "ADVP", "NEGP", "VP"];

const wordOptions = [
	"ART",
	"NN",
	"NE",
	"VVFIN",
	"VVPP",
	"VAFIN",
	"PPER",
	"PRF",
	"PPOSAT",
	"APPR",
	"APPRART",
	"ADV",
	"ADJD",
	"PTKNEG"
];

export function TreeEditor({
	tree,
	setTree,
	setInput
}: {
	tree: TreeNode;
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
			// Convert leaf into a non-leaf by moving its value down
			const oldLeafNode = { value: node.value, children: [] }; // Preserve original text

			// Assign default value from dropdown (first in phrase list)
			node.value = phraseOptions[0]; // Default to "NP" (or whatever the first entry is)
			node.children = [oldLeafNode]; // Move the old text as a child node
		} else {
			// Regular non-leaf node: Add a new child normally
			node.children.push({ value: "NewNode", children: [] });
		}
		updateTree({ ...tree });
	};

	const handleDelete = (parent: TreeNode | null, node: TreeNode) => {
		if (!parent) return;
		parent.children = parent.children.filter(child => child !== node);
		updateTree({ ...tree });
	};

	const renderNode = (node: TreeNode, parent: TreeNode | null = null, id: number) => {
		const isLeaf = node.children.length === 0;

		return (
			<div key={`node-${id}`} className="ml-4 pl-4 border-l-2 border-gray-300 space-y-2 py-1">
				<div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg shadow-sm">
					{/* Use a dropdown for non-leaf nodes and text input for leaf nodes */}
					{isLeaf ? (
						<input
							type="text"
							className="border rounded px-3 py-1 text-sm w-32 focus:ring-2 focus:ring-blue-400 outline-none"
							value={node.value}
							onChange={e => handleRename(node, e.target.value)}
							placeholder="Enter text..."
						/>
					) : (
						<select
							title="Select a phrase or word"
							className="border rounded px-3 py-1 text-sm bg-white w-36"
							value={node.value}
							onChange={e => handleRename(node, e.target.value)}
						>
							<optgroup label="Phrases">
								{phraseOptions.map(option => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</optgroup>
							<optgroup label="Words">
								{wordOptions.map(option => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</optgroup>
						</select>
					)}

					<button
						onClick={() => handleAddChild(node)}
						className="p-1 bg-secondary text-white rounded hover:bg-blue-600 transition-colors"
						aria-label="Add child node"
					>
						<PlusIcon className="h-4 w-4" />
					</button>

					{parent && (
						<button
							onClick={() => handleDelete(parent, node)}
							className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
							aria-label="Delete node"
						>
							<TrashIcon className="h-4 w-4" />
						</button>
					)}
				</div>

				{node.children.length > 0 && (
					<div className="space-y-1">
						{node.children.map(child => renderNode(child, node, id++))}
					</div>
				)}
			</div>
		);
	};

	return <div>{renderNode(tree,null , 1)}</div>;
}

function serializeTree(node: TreeNode): string {
	if (node.children.length === 0) {
		return node.value; // Base case: Leaf node
	}

	const childrenText = node.children.map(serializeTree).join(" ");

	return `[${node.value} ${childrenText}]`;
}