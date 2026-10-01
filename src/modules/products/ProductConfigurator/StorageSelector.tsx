import { CHOICE_FIELDS } from '@/modules/products/configuration';

import { OptionGroup } from './OptionGroup';

import styles from './ProductConfigurator.module.scss';

import type { StorageOption } from '@/lib/api/types';

interface StorageSelectorProps {
  options: StorageOption[];
  selected: string | undefined;
  onSelect: (capacity: string) => void;
}

export function StorageSelector({ options, selected, onSelect }: StorageSelectorProps) {
  return (
    <OptionGroup id="storage-label" legend="Storage. How much space do you need?">
      <div className={styles.storageOptions}>
        {options.map((option) => (
          <label key={option.capacity} className={styles.storage}>
            <input
              type="radio"
              name={CHOICE_FIELDS.storage}
              value={option.capacity}
              className="visually-hidden"
              checked={selected === option.capacity}
              onChange={() => onSelect(option.capacity)}
            />
            <span>{option.capacity}</span>
          </label>
        ))}
      </div>
    </OptionGroup>
  );
}
