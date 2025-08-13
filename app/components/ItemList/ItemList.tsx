import type { Item } from '@/app/types/models';
import { ItemItem } from './ItemItem';
import styles from './ItemList.module.css';

interface ItemListProps {
  items: Item[];
  libraryPath: string;
}

export function ItemList({ items, libraryPath }: ItemListProps) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ItemItem key={item.id} image={item} libraryPath={libraryPath} />
      ))}
    </div>
  );
}