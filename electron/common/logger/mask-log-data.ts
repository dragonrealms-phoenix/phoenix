import { includesIgnoreCase } from '../string/includes-ignore-case.js';

/**
 * Although we make an effort to not log sensitive data, it's possible
 * we may accidentally log something we shouldn't. This method attempts
 * to mask any sensitive data that may have been logged.
 */
export const maskSensitiveValues = (options: {
  /**
   * The JSON object to sanitize.
   */
  json: any;
  /**
   * List of keys to replace with a mask.
   * Default is ["password", "key"]
   */
  keys?: Array<string>;
  /**
   * The value to replace the matched keys with.
   * Default is "***REDACTED***".
   */
  mask?: string;
}): any => {
  const {
    json,
    keys = ['password', 'accessToken', 'apiKey'],
    mask = '***REDACTED***',
  } = options;

  if (isNotMaskable(json)) {
    return json;
  }

  const masked = { ...json };

  Object.keys(masked).forEach((key) => {
    const value = masked[key];
    if (includesIgnoreCase(keys, key)) {
      masked[key] = mask;
    } else if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        masked[key] = value.map((item) =>
          maskSensitiveValues({ json: item, keys, mask })
        );
      } else {
        masked[key] = maskSensitiveValues({ json: value, keys, mask });
      }
    }
  });

  return masked;
};

export const isNotMaskable = (value: any): boolean => {
  const typeofValue = typeof value;
  return (
    value === null ||
    value === undefined ||
    value instanceof Date ||
    typeofValue !== 'object'
  );
};
