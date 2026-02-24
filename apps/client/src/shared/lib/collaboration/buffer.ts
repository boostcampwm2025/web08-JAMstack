export const toUint8Array = (input: Uint8Array | ArrayBuffer): Uint8Array => {
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
};
