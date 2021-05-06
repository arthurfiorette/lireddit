import { Resolver } from '@urql/exchange-graphcache';
import { stringifyVariables } from 'urql';

export type MergeMode = 'before' | 'after';

// TODO: https://twitter.com/benawad/status/1303503308271816711/photo/1
export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const inTheCache = cache.resolve(entityKey, fieldKey);
    info.partial = !inTheCache;
    const results: string[] = [];
    for (const { fieldKey } of fieldInfos) {
      const data = cache.resolve(entityKey, fieldKey) as string[];
      results.push(...data);
    }
    return results;
  };
};
