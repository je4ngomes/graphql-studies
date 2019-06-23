import { mergeTypes, mergeResolvers, fileLoader } from 'merge-graphql-schemas';

const loadFilesContent = (target) => fileLoader(target.dir, { all: true });
const sortByType = (a, b) => {
  const typeA = a.type.toUpperCase();
  const typeB = b.type.toUpperCase();

  if (typeA < typeB) return -1;
  if (typeA > typeB) return 1;

  return 0;
}

export default (targets) => {
    const [resolvers, types] = targets
                                  .sort(sortByType)
                                  .map(loadFilesContent);
    return { 
        schema: mergeTypes(types), 
        resolvers: mergeResolvers(resolvers)
    };
};