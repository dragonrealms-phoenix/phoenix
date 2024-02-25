import snakeCase from 'lodash-es/snakeCase.js';

export const toUpperSnakeCase = (value: string): string => {
  return snakeCase(value).toUpperCase();
};
