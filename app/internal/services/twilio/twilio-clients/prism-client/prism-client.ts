// prism-request-client.ts
import RequestClient from "twilio/lib/base/RequestClient";
import Response from "twilio/lib/http/response";

type ReqOpts<TData = unknown, TParams = object> = RequestClient.RequestOptions<TData, TParams>;

export class PrismRequestClient extends RequestClient {
  private prismUrl: string;

  constructor(prismUrl: string, opts?: RequestClient.RequestClientOptions) {
    super(opts);
    this.prismUrl = prismUrl.replace(/\/+$/, "");
  }

  request<TData>(opts: ReqOpts<TData>): Promise<Response<TData>> {
    const rewrittenUri = opts.uri.replace(/^https:\/\/.*?\.twilio\.com/, this.prismUrl);

    //debug
    //console.log("[PrismRequestClient]", opts.method, opts.uri, "->", rewrittenUri);

    return super.request({
      ...opts,
      uri: rewrittenUri,
    });
  }
}
