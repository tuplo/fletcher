import { server, getRandomPort } from "src/mocks";

import fletcher from "./index";

describe("cookies", () => {
	let url: URL;
	let port: number;

	const cookie = [
		"vuecinemas#lang=en; path=/; secure; SameSite=None",
		"ASP.NET_SessionId=ra053thyy15mq5pgomoijp33; path=/; secure; HttpOnly; SameSite=None",
		"SC_ANALYTICS_GLOBAL_COOKIE=3c8c6306819344c8bcf3d0cb31931482|False; expires=Tue, 18-Oct-2033 11:14:30 GMT; path=/; secure; HttpOnly; SameSite=None",
		"hasLayout=true; path=/; SameSite=Lax;",
		"microservicesToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTgyYzE2Ni04MzJhLTQxYjItYjY4Ni1mZDJkNDc2MTRlMjQiLCJDb3VudHJ5IjoiVUsiLCJBdXRoIjoiMyIsIlNob3dpbmciOiIzIiwiQm9va2luZyI6IjMiLCJQYXltZW50IjoiMyIsIlBhcnRuZXIiOiIzIiwiTG95YWx0eSI6IjMiLCJuYmYiOjE2OTc4ODY4NzAsImV4cCI6MTY5NzkzMDA3MCwiaXNzIjoiUHJvZCJ9.SkzG5u72b3jsn5jtLpYrrFw95A0oX44TXJ6tWL0xSiU; path=/; expires=2023-10-21T23:14:30Z; Secure; HttpOnly; SameSite=None;",
		"microservicesRefreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTgyYzE2Ni04MzJhLTQxYjItYjY4Ni1mZDJkNDc2MTRlMjQiLCJDb3VudHJ5IjoiVUsiLCJuYmYiOjE2OTc4ODY4NzAsImV4cCI6MTY5Nzk3MDg3MCwiaXNzIjoiQXV0aFByb2QifQ.r-cO0OUel346ywM8r-RwUET5C-w359WO5eMjw5mjYUg; path=/; expires=2023-10-22T10:34:30Z; Secure; HttpOnly; SameSite=None;",
		"accessTokenExpirationTime=2023-10-21T23%3A14%3A30Z; path=/; expires=2023-10-21T23:14:30Z; Secure; HttpOnly; SameSite=None;",
		"refreshTokenExpirationTime=2023-10-22T10%3A34%3A30Z; path=/; expires=2023-10-22T10:34:30Z; Secure; HttpOnly; SameSite=None;",
		"__cflb=0H28vzrjBJNmiR3YiPyLi5QGz1saZSwK5igjWUs5ezX; SameSite=Lax; path=/; expires=Sat, 21-Oct-23 12:14:30 GMT; HttpOnly",
		"__cfwaitingroom=ChhzVjFoZVNXQWorZC9aWHFJSDZwOXNRPT0SqAJJM0RPV2sxNVdKOGlqWHBqV2FkY1JaLzJRbzNQRy9YbnhoeDd3cVJJWTJaQ1JqM0RweVlLdjhLb09zNHp1clVlcDlmN3g1WEo3REhRUkFYNUIrTjhOR3ZDdEJpMjNmaFZWRndKU3YyS0hFNVdWVlBOUU5QZi9aUDhPVWpQU05pUkFLcWZ5WXQ5U2h5SmVUSUVBL1dRUkI3VnNqREE4S2pxSVZLbms4QzZQZDcwRWNjSVkrRjRZamh2eE5TQlFSSENKZVAxNHFzc05Wb3FEeXhVT2lrdUQ5dXdIVURpdU1zZWNCbjlmTERMeGFnaTZkWXppT2pCT1FRRGQyWUxsTHdiL3lqdFNHLzljOVFsaG5ONzEramxRQU0vajRrc2wvZkR1RFI2a2RHbA%3D%3D; Domain=www.myvue.com; Path=/; Expires=Sat, 21 Oct 2023 11:29:30 GMT; HttpOnly; SameSite=Lax",
		"__cfruid=6b272a94ad01cdcf9484677f263f74a5f9b03c54-1697886870; path=/; domain=.myvue.com; HttpOnly; Secure; SameSite=None",
	];

	beforeAll(async () => {
		port = await getRandomPort();
		server.listen(port);
	});

	beforeEach(() => {
		url = new URL("http://localhost");
		url.port = `${port}`;
	});

	afterAll(async () => {
		server.close();
	});

	it("should return cookies", async () => {
		url.pathname = "/set-cookie";
		const cookieJar = await fletcher.cookies(url.href, {
			jsonData: { cookie },
		});
		const actual = cookieJar.getCookies();

		expect(actual).toHaveLength(cookie.length);
	});

	it("returns cookie string serialized", async () => {
		url.pathname = "/set-cookie";
		const cookieJar = await fletcher.cookies(url.href, {
			jsonData: { cookie },
		});
		const actual = cookieJar.getCookieString();

		const expected =
			"vuecinemas#lang=en; ASP.NET_SessionId=ra053thyy15mq5pgomoijp33; SC_ANALYTICS_GLOBAL_COOKIE=3c8c6306819344c8bcf3d0cb31931482%7CFalse; hasLayout=true; microservicesToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTgyYzE2Ni04MzJhLTQxYjItYjY4Ni1mZDJkNDc2MTRlMjQiLCJDb3VudHJ5IjoiVUsiLCJBdXRoIjoiMyIsIlNob3dpbmciOiIzIiwiQm9va2luZyI6IjMiLCJQYXltZW50IjoiMyIsIlBhcnRuZXIiOiIzIiwiTG95YWx0eSI6IjMiLCJuYmYiOjE2OTc4ODY4NzAsImV4cCI6MTY5NzkzMDA3MCwiaXNzIjoiUHJvZCJ9.SkzG5u72b3jsn5jtLpYrrFw95A0oX44TXJ6tWL0xSiU; microservicesRefreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTgyYzE2Ni04MzJhLTQxYjItYjY4Ni1mZDJkNDc2MTRlMjQiLCJDb3VudHJ5IjoiVUsiLCJuYmYiOjE2OTc4ODY4NzAsImV4cCI6MTY5Nzk3MDg3MCwiaXNzIjoiQXV0aFByb2QifQ.r-cO0OUel346ywM8r-RwUET5C-w359WO5eMjw5mjYUg; accessTokenExpirationTime=2023-10-21T23%3A14%3A30Z; refreshTokenExpirationTime=2023-10-22T10%3A34%3A30Z; __cflb=0H28vzrjBJNmiR3YiPyLi5QGz1saZSwK5igjWUs5ezX; __cfwaitingroom=ChhzVjFoZVNXQWorZC9aWHFJSDZwOXNRPT0SqAJJM0RPV2sxNVdKOGlqWHBqV2FkY1JaLzJRbzNQRy9YbnhoeDd3cVJJWTJaQ1JqM0RweVlLdjhLb09zNHp1clVlcDlmN3g1WEo3REhRUkFYNUIrTjhOR3ZDdEJpMjNmaFZWRndKU3YyS0hFNVdWVlBOUU5QZi9aUDhPVWpQU05pUkFLcWZ5WXQ5U2h5SmVUSUVBL1dRUkI3VnNqREE4S2pxSVZLbms4QzZQZDcwRWNjSVkrRjRZamh2eE5TQlFSSENKZVAxNHFzc05Wb3FEeXhVT2lrdUQ5dXdIVURpdU1zZWNCbjlmTERMeGFnaTZkWXppT2pCT1FRRGQyWUxsTHdiL3lqdFNHLzljOVFsaG5ONzEramxRQU0vajRrc2wvZkR1RFI2a2RHbA%3D%3D; __cfruid=6b272a94ad01cdcf9484677f263f74a5f9b03c54-1697886870";
		expect(actual).toBe(expected);
	});

	it("can add more cookies to returned cookie jar", async () => {
		url.pathname = "/set-cookie";
		const cookieJar = await fletcher.cookies(url.href, {
			jsonData: { cookie: ["c1=foobar", "c2=foobar"] },
		});
		cookieJar.setCookie("c3=foobar");

		const actual = cookieJar.getCookies();
		expect(actual).toHaveLength(3);

		const actualCookieString = cookieJar.getCookieString();
		expect(actualCookieString).toBe("c1=foobar; c2=foobar; c3=foobar");
	});
});
