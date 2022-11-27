import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { STATUS_CODES } from "node:http";

import https from "node:https";

async function requestListener(
	request: IncomingMessage,
	response: ServerResponse
) {
	response.statusCode = 200;
	response.statusMessage = STATUS_CODES[200] || "";
	response.end("hello world\n");
}

export const server = https.createServer(
	{
		cert: fs.readFileSync(`${__dirname}/certs/localhost.crt`),
		key: fs.readFileSync(`${__dirname}/certs/localhost.key`),
	},
	requestListener
);
