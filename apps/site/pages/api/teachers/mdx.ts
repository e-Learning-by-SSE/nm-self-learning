import { compileMarkdown } from "@self-learning/markdown";
import { NextApiHandler } from "next";

const mdxApiHandler: NextApiHandler = async (req, res) => {
	return res.status(200).json(await compileMarkdown(req.body ?? ""));
};

export default mdxApiHandler;
