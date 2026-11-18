import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		res.setHeader("Allow", "GET");
		return res.status(405).end();
	}

	res.setHeader("Cache-Control", "no-store");
	return res.status(200).json({ domain: process.env.PLAUSIBLE_OWN_DOMAIN ?? "" });
}
