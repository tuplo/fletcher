/* eslint-disable class-methods-use-this */
import Cookie from "cookie";

export type ICookie = {
	key: string;
	value: string;
};

export class CookieJar {
	cookies: ICookie[] = [];

	find(key: string) {
		return this.cookies.find((cookie) => cookie.key === key);
	}

	getCookies() {
		return this.cookies;
	}

	getCookieString() {
		return this.cookies
			.map((cookie) => {
				const { key, value } = cookie;
				return `${key}=${value}`;
			})
			.join("; ");
	}

	parseCookieFromString(cookieStr: string) {
		const [, key] = /^([^=]+)/.exec(cookieStr) || [];
		const cookie = Cookie.parse(cookieStr);
		const value = cookie[key];

		return {
			...cookie,
			key,
			value,
		} as ICookie;
	}

	setCookie(cookie: ICookie | string) {
		const c =
			typeof cookie === "string" ? this.parseCookieFromString(cookie) : cookie;
		this.cookies.push(c);
	}

	setCookies(cookies: ICookie[] | string[] = []) {
		for (const cookie of cookies) {
			this.setCookie(cookie);
		}
	}
}
