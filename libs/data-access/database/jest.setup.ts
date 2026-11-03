import { TextEncoder, TextDecoder } from "node:util";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
	path: path.resolve(__dirname, "../../../.env")
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
