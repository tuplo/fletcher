/* eslint-disable class-methods-use-this */
import type { ICacheParams } from "../fletcher.d";
import { md5 } from "../helpers/md5";
import { sortObject } from "../helpers/sort-object";

export class Cache {
	db = new Map();

	hit = <T = string>(params: ICacheParams): T | undefined => {
		const { options } = params;
		if (!options?.cache) {
			return;
		}

		const key = this.key(params);

		const { cacheMethods } = options;
		if (cacheMethods?.hit) {
			return cacheMethods.hit(key) as T;
		}

		if (this.db.has(key)) {
			return this.db.get(key) as T;
		}

		return;
	};

	key = (params: ICacheParams): string => {
		const { format, options, url } = params;

		const { cacheMethods } = options || {};
		if (cacheMethods?.key) {
			return cacheMethods.key(params);
		}

		const seed = [format, url, JSON.stringify(sortObject(params))]
			.filter(Boolean)
			.join("");

		return md5(seed);
	};

	write = (params: ICacheParams): void => {
		const { options } = params;
		if (!options?.cache) return;

		const { payload, ...cacheParams } = params;
		const key = this.key(cacheParams);

		const { cacheMethods } = options;
		if (cacheMethods?.write) {
			cacheMethods.write(key, payload);
			return;
		}

		this.db.set(key, payload);
	};
}
