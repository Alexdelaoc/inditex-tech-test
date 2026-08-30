import { SPEC_LABELS } from '@/modules/products/specLabels';

import styles from './SpecsTable.module.scss';

import type { ProductSpecs } from '@/lib/api/types';

export function SpecsTable({ specs }: { specs: ProductSpecs }) {
  const entries = Object.entries(SPEC_LABELS) as [keyof ProductSpecs, string][];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Specifications</h2>

      <dl className={styles.rows}>
        {entries.map(([key, label]) => (
          <div key={key} className={styles.row}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.data}>{specs[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
