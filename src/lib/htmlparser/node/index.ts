/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyNode, CheerioAPI, load } from "cheerio";
import { IsomorphicHTMLElement, ParseHTML } from "../dom.js";
import { extractAll } from "../extraction.js";

export const parseHTML: ParseHTML = (html) => {
  return createElement(load(html));
};

function createElement(
  $: CheerioAPI,
  element?: AnyNode,
): IsomorphicHTMLElement {
  return {
    find(selector) {
      const target = (
        element ? $(element).find(selector).first() : $(selector).first()
      ).get()[0];

      if (target) {
        return createElement($, target);
      }

      return undefined;
    },
    findAll(selector) {
      const target = element ? $(element).find(selector) : $(selector);

      //@ts-ignore
      return target.get().map((v: any) => createElement($, v));
    },
    extract(selector, extraFilters) {
      //@ts-ignore
      return extractAll(selector, (v) => this.find(v), extraFilters)[0] as any;
    },
    extractAll(selector, extraFilters) {
      return extractAll(selector, (v) => this.findAll(v), extraFilters);
    },
    get text() {
      return element ? $(element).text() : "";
    },
    get attrs() {
      return element ? $(element).attr() || {} : {};
    },
    get nextSibling() {
      return element?.nextSibling
        ? createElement($, element.nextSibling)
        : undefined;
    },
    get previousSibling() {
      return element?.previousSibling
        ? createElement($, element.previousSibling)
        : undefined;
    },
  };
}
