// Two small helpers that older iPads (before iPadOS 15.4) do not have.
if (!Object.hasOwn) Object.hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
if (!Array.prototype.at) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'at', { value(i) { const n = Math.trunc(i) || 0; return this[n < 0 ? this.length + n : n]; }, writable: true, configurable: true });
}
