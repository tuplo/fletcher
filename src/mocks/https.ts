import fs from "node:fs";
import {
	type IncomingMessage,
	type ServerResponse,
	STATUS_CODES,
} from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function requestListener(
	request: IncomingMessage,
	response: ServerResponse
) {
	response.statusCode = 200;
	response.statusMessage = STATUS_CODES[200] || "";
	response.end("hello world\n");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const server = https.createServer(
	{
		cert: fs.readFileSync(`${__dirname}/certs/localhost.crt`),
		key: fs.readFileSync(`${__dirname}/certs/localhost.key`),
	},
	requestListener
);
