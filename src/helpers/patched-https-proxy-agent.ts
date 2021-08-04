import HttpsProxyAgent from 'https-proxy-agent';
import type { HttpsProxyAgentOptions } from 'https-proxy-agent';

interface Options extends HttpsProxyAgentOptions {
  rejectUnauthorized?: boolean;
}

export default class PatchedHttpsProxyAgent extends HttpsProxyAgent {
  extraOpts: string | Partial<Options>;

  constructor(opts: string | Options) {
    super(opts);
    this.extraOpts = opts;
  }

  // @ts-expect-error Parameter 'opts' implicitly has an 'any' type
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  callback(req, opts, fn): void {
    // @ts-expect-error Property 'callback' does not exist on type 'HttpsProxyAgent'
    return super.callback(req, { ...this.extraOpts, ...opts }, fn);
  }
}
