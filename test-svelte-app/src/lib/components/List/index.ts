import OriginalList from "./List.svelte";
import OriginalItem from "./Item.svelte";

const List = OriginalList as ListStatic;
List.Item = OriginalItem as ListItemStatic;

export { List };

export interface ListStatic {
  new (...args: ConstructorParameters<typeof OriginalList>): OriginalList;
  Item: ListItemStatic;
}

export interface ListItemStatic {
  new (...args: ConstructorParameters<typeof OriginalItem>): OriginalItem;
}
