import { Filter } from "./extraction.js";

export interface ParseHTML {
  /**
   * Parse provided HTML
   *
   * @param html HTML string to parse
   */
  (html: string): IsomorphicHTMLElement;
}

export interface ExtractFromHTML {
  /**
   * Parse provided HTML
   *
   * @param html HTML string to parse
   */
  (html: string, schema: Record<string, string>): Record<string, unknown>;
}

/**
 * Structure representing one HTML element
 */
export interface IsomorphicHTMLElement {
  /**
   * Find one HTML element by provided HTML Selector
   *
   * @param selector HTML selector
   */
  find(selector: string): IsomorphicHTMLElement | undefined;
  /**
   * Find all HTML elements by provided HTML Selector
   *
   * @param selector HTML selector
   */
  findAll(selector: string): IsomorphicHTMLElement[];
  /**
   * Get the combined text contents of each element in the set of matched elements, including their descendants
   *
   * @param selector HTML selector
   */
  text: string;
  /**
   * Get all element attributes
   *
   * @param selector HTML selector
   */
  attrs: Record<string, string>;
  /**
   * Get next sibling
   */
  nextSibling?: IsomorphicHTMLElement;
  /**
   * Get previous sibling
   */
  previousSibling?: IsomorphicHTMLElement;
  /**
   * Extract value from first found element by provided selector
   *
   * @example
   * ```
   * el.extract('.content @ attrs.data-summary | trim | uppercase')
   *
   * el.extract('.content @ attrs.data-summary | myCallback | uppercase', {
   *     myCallback(value) {
   *         return typeof value === 'string' ? value.trim() : value
   *     }
   * })
   * ```
   * @param selector HTML selector
   * @extraFilters custom filters
   */
  extract<T>(
    selector: string,
    extraFilters?: Record<string, Filter>,
  ): T | undefined;
  /**
   * Extract value by provided selector
   *
   * @example
   * ```
   * el.extractAll('.content @ attrs.data-summary | trim | uppercase')
   *
   * el.extractAll('.content @ attrs.data-summary | myCallback | uppercase', {
   *     myCallback(value) {
   *         return typeof value === 'string' ? value.trim() : value
   *     }
   * })
   * ```
   * @param selector HTML selector
   * @extraFilters custom filters
   */
  extractAll<T>(selector: string, extraFilters?: Record<string, Filter>): T[];
}
