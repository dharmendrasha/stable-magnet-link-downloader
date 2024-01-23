import fetchPonyfill from "fetch-ponyfill";
import { shuffle } from "common-stuff";
import { parseHTML, IsomorphicHTMLElement } from "../../htmlparser/index.js";

import { isInBrowser } from "./utils.js";
import { SHOULD_USE_PROXY } from "../../../config.js";

const { fetch } = fetchPonyfill();

async function fetchBrowser(url: string): Promise<string> {
  const proxies = shuffle<(v: string) => string>([
    (v) =>
      SHOULD_USE_PROXY
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(v)}`
        : v,
    (v) =>
      SHOULD_USE_PROXY
        ? `https://proxy.torrent-browse.workers.dev/?url=${encodeURIComponent(v)}`
        : v,
  ]);
  const proxyUrls = proxies.map((v) => v(url));

  const retry = async (url: string, proxies: string[]): Promise<string> => {
    return fetch(url)
      .then((v) => {
        if (!v.ok) {
          throw new Error(`Proxy or API returned ${v.status} status code`);
        }

        return v.text();
      })
      .catch((err) => {
        const nextUrl = proxies.pop();

        if (nextUrl) {
          return retry(nextUrl, proxies);
        }

        return Promise.reject(err);
      });
  };

  return retry(proxyUrls.pop()!, proxyUrls);
}

async function fetchNode(url: string): Promise<string> {
  return fetch(url, {
    headers: {
      "User-Agent": `stable-torrent-browse (+https://github.com/dharmendrasha/relieable-torrent-browse)`,
    },
  }).then((v) => v.text());
}

export async function fetchText(url: string): Promise<string> {
  if (isInBrowser) {
    return fetchBrowser(url);
  }
  return fetchNode(url);
}

export async function fetchJson<T = unknown>(url: string): Promise<T> {
  return JSON.parse(await fetchText(url));
}

export async function fetchHtml(url: string): Promise<IsomorphicHTMLElement> {
  return parseHTML(await fetchText(url));
}
