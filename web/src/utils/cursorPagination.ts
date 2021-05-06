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

//   const visited = new Set();
//   let result: NullArray<string> = [];
//   let prevOffset: number | null = null;

//   for (let i = 0; i < size; i++) {
//     const { fieldKey, arguments: args } = fieldInfos[i];
//     if (args === null || !compareArgs(fieldArgs, args)) {
//       continue;
//     }

//     const links = cache.resolve(entityKey, fieldKey) as string[];
//     const currentOffset = args[offsetArgument];

//     if (
//       links === null ||
//       links.length === 0 ||
//       typeof currentOffset !== 'number'
//     ) {
//       continue;
//     }

//     const tempResult: NullArray<string> = [];

//     for (let j = 0; j < links.length; j++) {
//       const link = links[j];
//       if (visited.has(link)) continue;
//       tempResult.push(link);
//       visited.add(link);
//     }

//     if (
//       (!prevOffset || currentOffset > prevOffset) ===
//       (mergeMode === 'after')
//     ) {
//       result = [...result, ...tempResult];
//     } else {
//       result = [...tempResult, ...result];
//     }

//     prevOffset = currentOffset;
//   }

//   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
//   if (hasCurrentPage) {
//     return result;
//   } else if (!(info as any).store.schema) {
//     return undefined;
//   } else {
//     info.partial = true;
//     return result;
//   }
// };
