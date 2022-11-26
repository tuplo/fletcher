import { rest } from "msw";
import fs from "node:fs";
import path from "node:path";
import type { RestContext } from "msw";

function replyWithFile(ctx: RestContext, basename: string) {
	const file = path.join(__dirname, "__data__", basename);
	const body = fs.readFileSync(file);

	return ctx.body(body);
}

export const handlers = [
	// index.test.ts
	rest.get("https://fletcher.dev/file/:basename", (req, res, ctx) => {
		const { basename } = req.params as { basename: string };
		return res(ctx.status(200), replyWithFile(ctx, basename));
	}),

	rest.get("https://fletcher.dev/error", (_, res, ctx) =>
		res(ctx.status(500), ctx.set("foo", "bar"))
	),

	rest.get("https://fletcher.dev/dr%C3%A1cula", (_, res, ctx) =>
		res(ctx.status(200), ctx.json({ foo: "bar" }))
	),

	rest.get("https://fletcher.dev/headers", (_, res, ctx) =>
		res(ctx.status(200), ctx.set("foo", "bar"))
	),

	// body.test.ts
	rest.post("https://fletcher.dev/body", async (req, res, ctx) => {
		const { method } = req;
		const headers = Object.fromEntries([...req.headers.entries()]);
		const body = await req.text();
		return res(ctx.status(200), ctx.json({ method, headers, body }));
	}),
];
