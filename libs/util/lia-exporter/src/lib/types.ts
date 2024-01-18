export type ExportOptions = {
	addTitlePage?: boolean;
	language?: "en" | "de";
	narrator?: "female" | "male";
	considerTopics?: boolean;
	exportMailAddresses?: boolean;
	storagesToInclude?: string[];
	storageDestination?: string;
};

/**
 * Used to make absolute paths to media files on our storage server relative.
 */
export type MediaFileReplacement = {
	source: string;
	destination: string;
};
