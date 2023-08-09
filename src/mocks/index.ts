import buffer, { type TranscodeEncoding } from "node:buffer";
import fs from "node:fs";
import http, {
	STATUS_CODES,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import net from "node:net";
import path from "node:path";

import mime from "mime/lite";

async function extractBody(request: IncomingMessage) {
	return new Promise((resolve) => {
		let body = "";
		request.on("data", (chunk) => {
			body += chunk.toString();
		});

		request.on("end", () => {
			resolve(body);
		});
	});
}

async function wait(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function requestListener(
	request: IncomingMessage,
	response: ServerResponse
) {
	const { headers, method, url } = request;
	const body = await extractBody(request);
	if (!url) {
		response.end();
		return;
	}

	// /file/<filename>
	if (/^\/file/.test(url)) {
		const parts = url.split("/");
		const basename = parts[2];
		const file = path.join(__dirname, "__data__", basename);
		const buf = fs.readFileSync(file);
		const contentType = mime.getType(path.extname(basename)) || "text/plain";

		response.setHeader("content-type", contentType);
		response.write(buf);
		response.end();
		return;
	}

	// /anything
	if (url === "/anything") {
		const payload = { method, headers, body };

		response.setHeader("content-type", "application/json");
		response.setHeader("date", new Date("2022-12-25").toISOString());
		response.end(JSON.stringify(payload));
		return;
	}

	// /status-code/301
	if (/^\/status-code/.test(url)) {
		const endPathname = /\?/.test(url) ? url.indexOf("?") : url.length;
		const parts = url.slice(0, endPathname).split("/");
		const statusCode = Number(parts[2]);
		const parsed = new URL(`http://localhost${url}`);
		const statusText = parsed.searchParams.get("statusText");

		response.statusCode = statusCode;
		response.statusMessage = statusText || STATUS_CODES[statusCode] || "";
		response.end();
		return;
	}

	// /redirect-to?statusCode=302&url=http://localhost/redirected-to
	if (/^\/redirect-to/.test(url)) {
		const parsed = new URL(`http://localhost${url}`);
		const statusCode = Number(parsed.searchParams.get("statusCode"));
		const redirectToUrl = parsed.searchParams.get("url") || "";

		response.statusCode = statusCode;
		response.setHeader("Location", redirectToUrl);
		response.end();
		return;
	}

	// /error
	if (url === "/error") {
		response.statusCode = 500;
		response.end();
		return;
	}

	// /redirected
	if (url === "/redirected") {
		response.write(JSON.stringify({ url }));
		response.end();
		return;
	}

	// /headers
	if (url === "/headers") {
		response.setHeader("foo", "bar");
		response.end();
		return;
	}

	// /dr%C3%A1cula
	if (url === "/dr%C3%A1cula") {
		response.write(JSON.stringify({ foo: "bar" }));
		response.end();
		return;
	}

	// /encoding/latin1
	if (/^\/encoding/.test(url)) {
		const parts = url.split("/");
		const encoding = parts[2] as TranscodeEncoding;
		const str = "Opinião";
		const payload = buffer.transcode(Buffer.from(str), "utf8", encoding);

		response.write(payload);
		response.end();
		return;
	}

	// /delay/10
	if (/^\/delay/.test(url)) {
		const parts = url.split("/");
		const delay = Number(parts[2]);
		await wait(delay * 1_000);

		response.end();
		return;
	}

	response.statusCode = 404;
	response.statusMessage = STATUS_CODES[404] || "";
	response.end();
}

export const server = http.createServer(requestListener);

export async function getRandomPort(): Promise<number> {
	return new Promise((resolve) => {
		const srv = net.createServer();
		srv.listen(0, () => {
			const address = srv.address();
			if (!address) {
				resolve(-1);
				return;
			}

			const { port } = address as net.AddressInfo;
			srv.close(() => resolve(port));
		});
	});
}
