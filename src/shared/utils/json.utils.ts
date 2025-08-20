export const jsonStringifyReplacer = (key: any, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return value;
};
