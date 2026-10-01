import { CHOICE_FIELDS } from '@/modules/products/configuration';

import { OptionGroup } from './OptionGroup';

import styles from './ProductConfigurator.module.scss';

import type { ColorOption } from '@/lib/api/types';

interface ColorSelectorProps {
  options: ColorOption[];
  selected: string | undefined;
  onSelect: (name: string) => void;
}

export function ColorSelector({ options, selected, onSelect }: ColorSelectorProps) {
  return (
    <OptionGroup id="color-label" legend="Colour. Pick your favourite.">
      <div className={styles.colorOptions}>
        {options.map((option) => (
          <label key={option.name} className={styles.color}>
            <input
              type="radio"
              name={CHOICE_FIELDS.color}
              value={option.name}
              aria-label={option.name}
              className="visually-hidden"
              checked={selected === option.name}
              onChange={() => onSelect(option.name)}
            />
            <span className={styles.swatch} style={{ backgroundColor: option.hexCode }} />
            <span className={styles.colorName} aria-hidden="true">
              {option.name}
            </span>
          </label>
        ))}
      </div>
    </OptionGroup>
  );
}
