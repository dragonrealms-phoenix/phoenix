export const includesIgnoreCase = (
  values: Array<string>,
  valueToFind: string
): boolean => {
  return values.some((value) => equalsIgnoreCase(value, valueToFind));
};

export const equalsIgnoreCase = (a: string, b: string): boolean => {
  return a?.toLowerCase() === b?.toLowerCase();
};
