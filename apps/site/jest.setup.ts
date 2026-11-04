import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { TextEncoder, TextDecoder } from "util";

loadEnv({ path: resolve(__dirname, "../../.env") });

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
