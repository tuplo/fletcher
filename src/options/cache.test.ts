import { vi } from "vitest";

import type { ICacheParams } from "src/fletcher.d";

import { Cache } from "./cache";

describe("cache", () => {
	const cache = new Cache();

	describe("computes key", () => {
		it.each([
			["https://foo1.com", "dc5227de0e7d376d8bc477595bf3be33"],
			["https://foo2.com", "79b87b20192a4b9c07ca4fa46cb72367"],
		])("builds a unique string out of different URLs: %s", (url, expected) => {
			const cacheParams = { format: "json", url };
			const result = cache.key(cacheParams);
			expect(result).toBe(expected);
		});

		it.each([
			["text", "ee2e2ac44dca3649f6e4fbf1772cd091"],
			["json", "86041d779eaaf1d7d8eb8e7c0225c9db"],
			["html", "2df215ab5e5a5f4d545d000ab79715cf"],
			["script", "5983f83badaee8c5deb71b27c1887dac"],
		])(
			"builds a unique string out of different formats on the URL: %s",
			(format, expected) => {
				const cacheParams = { format, url: "https://foo.com" };
				const result = cache.key(cacheParams);
				expect(result).toBe(expected);
			}
		);

		it.each([
			[{ headers: { foo: "bar" } }, "3f375919652763146df264ee4187a2df"],
			[{ headers: { bar: "foo" } }, "d411dec8e69710cb26096c71de1199a4"],
		])(
			"builds a unique string out of different options on the URL",
			(options, expected) => {
				const cacheParams = { format: "json", url: "https://foo.com", options };
				const result = cache.key(cacheParams);
				expect(result).toBe(expected);
			}
		);

		it.each([
			[
				{
					headers: { foo: "bar", baz: "buz" },
					urlSearchParams: { quz: "qaz", qaz: "quz" },
				},
			],
			[
				{
					headers: { baz: "buz", foo: "bar" },
					urlSearchParams: { qaz: "quz", quz: "qaz" },
				},
			],
		])(
			"builds the same cache key for options ordered differently",
			(options) => {
				const cacheParams = { format: "json", url: "https://foo.com", options };
				const result = cache.key(cacheParams);
				const expected = "19afdd3a772dbb3144e4aa62defff5b7";
				expect(result).toBe(expected);
			}
		);
	});

	describe("accepts custom methods", () => {
		const url = "https://foo.com/page-1";
		let cacheParams: ICacheParams;
		const defaultCacheParams: ICacheParams = {
			format: "json",
			url,
			options: { cache: true },
		};

		beforeEach(() => {
			cacheParams = JSON.parse(JSON.stringify(defaultCacheParams));
		});

		it("uses hit custom method", () => {
			const hitSpy = vi.fn().mockReturnValue("foobar");
			cacheParams.options = {
				...cacheParams.options,
				cacheMethods: { hit: hitSpy },
			};
			const result = cache.hit(cacheParams);

			expect(result).toBe("foobar");
			expect(hitSpy).toHaveBeenCalledTimes(1);
			expect(hitSpy).toHaveBeenCalledWith("657cbd01f24115a1b4a7feb46c0fa295");
		});

		it("uses write custom method", () => {
			const writeSpy = vi.fn();
			cacheParams = {
				...cacheParams,
				options: {
					...cacheParams.options,
					cacheMethods: { write: writeSpy },
				},
				payload: "foobar",
			};
			cache.write(cacheParams);

			expect(writeSpy).toHaveBeenCalledTimes(1);
			expect(writeSpy).toHaveBeenCalledWith(
				"657cbd01f24115a1b4a7feb46c0fa295",
				"foobar"
			);
		});

		it("uses key custom method", () => {
			const keySpy = vi.fn().mockReturnValue("key-1");
			cacheParams = {
				...cacheParams,
				options: {
					...cacheParams.options,
					cacheMethods: { key: keySpy },
				},
			};
			cache.key(cacheParams);

			expect(keySpy).toHaveBeenCalledTimes(1);
			expect(keySpy).toHaveBeenCalledWith(cacheParams);
		});
	});
});
