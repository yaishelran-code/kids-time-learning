/** Suspended screens stay mounted but must not take part in user-visible assertions. */
export function allVisible<K extends keyof HTMLElementTagNameMap>(root: HTMLElement, selector: K): HTMLElementTagNameMap[K][];
export function allVisible<T extends Element = Element>(root: HTMLElement, selector: string): T[];
export function allVisible<T extends Element = Element>(root: HTMLElement, selector: string): T[] {
  const result: T[] = [];
  for (const child of Array.from(root.children)) {
    if (child.hasAttribute('hidden')) continue;
    if (child.matches(selector)) result.push(child as T);
    result.push(...Array.from(child.querySelectorAll<T>(selector)).filter(element => !element.closest('[hidden]')));
  }
  return result;
}
export function queryVisible<K extends keyof HTMLElementTagNameMap>(root: HTMLElement, selector: K): HTMLElementTagNameMap[K] | null;
export function queryVisible<T extends Element = Element>(root: HTMLElement, selector: string): T | null;
export function queryVisible<T extends Element = Element>(root: HTMLElement, selector: string): T | null {
  return allVisible<T>(root, selector)[0] ?? null;
}
export function visibleText(root: HTMLElement): string {
  const copy = root.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[hidden]').forEach(element => element.remove());
  return copy.textContent ?? '';
}
