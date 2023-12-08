/* eslint-disable class-methods-use-this */
import Cookie from "cookie";

export type ICookie = {
	key: string;
	value: string;
};

export class CookieJar {
	cookies: ICookie[] = [];

	setCookie(cookie: string | ICookie) {
		const c =
			typeof cookie === "string" ? this.parseCookieFromString(cookie) : cookie;
		this.cookies.push(c);
	}

	setCookies(cookies: string[] | ICookie[] = []) {
		cookies.forEach((cookie) => this.setCookie(cookie));
	}

	getCookieString() {
		return this.cookies
			.map((cookie) => {
				const { key, value } = cookie;
				return `${key}=${value}`;
			})
			.join("; ");
	}

	getCookies() {
		return this.cookies;
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
}
