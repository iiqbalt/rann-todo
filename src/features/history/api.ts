export const historyKeys = {
  all: ['history'] as const,
  lists: () => [...historyKeys.all, 'list'] as const,
  list: () => [...historyKeys.lists()] as const,
}
