/**
 * Undo `polyfill()`
 *
 * @example
 * ```js
 * import { polyfill } from 'error-cause-polyfill'
 *
 * const undoPolyfill = polyfill()
 * undoPolyfill()
 * ```
 */
export type UndoPolyfill = () => void

/**
 * Modifies the global error classes (`Error`, `TypeError`, etc.) so they
 * support `error.cause`. If `error.cause` is already supported, this is a noop.
 *
 * This returns a function to undo everything.
 *
 * @example
 * ```js
 * import { polyfill } from 'error-cause-polyfill'
 *
 * polyfill()
 *
 * try {
 *   doSomething()
 * } catch (cause) {
 *   throw new Error('message', { cause })
 * }
 * ```
 */
export function polyfill(): UndoPolyfill

/**
 * Object with each error class (`Error`, `TypeError`, etc.) but with
 * `error.cause` support.
 */
export interface Errors {
  Error: Error
  ReferenceError: Error
  TypeError: Error
  SyntaxError: Error
  RangeError: Error
  URIError: Error
  EvalError: Error
  /**
   * `undefined` if the system does not support `AggregateError`
   */
  AggregateError?: Error
}

/**
 * Returns an object with each error class (`Error`, `TypeError`, etc.) but with
 * `error.cause` support. If `error.cause` is already supported, this returns
 * the global error classes as is.
 *
 * Unlike `polyfill()`, this does not modify the global error classes.
 *
 * @example
 * ```js
 * import { getErrors } from 'error-cause-polyfill'
 *
 * const Errors = getErrors()
 *
 * try {
 *   doSomething()
 * } catch (cause) {
 *   throw new Errors.Error('message', { cause })
 * }
 * ```
 */
export function getErrors(): Errors

/**
 * Returns whether the global error classes currently support `error.cause`.
 *
 * @example
 * ```js
 * import { hasSupport, polyfill } from 'error-cause-polyfill'
 *
 * console.log(hasSupport()) // false
 * polyfill()
 * console.log(hasSupport()) // true
 * ```
 */
export function hasSupport(): boolean
