/* eslint-disable class-methods-use-this */
import Cookie from "cookie";

export interface ICookie {
	key: string;
	value: string;
	serialized: string;
}

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
		return this.cookies.map((cookie) => cookie.serialized).join("; ");
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
			serialized: Cookie.serialize(key, value),
		} as ICookie;
	}
}
