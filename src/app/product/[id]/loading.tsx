import { BackLink } from '@/components/BackLink/BackLink';
import { LoadingBar } from '@/components/LoadingBar/LoadingBar';
import { ProductConfiguratorSkeleton } from '@/modules/products/ProductConfigurator/ProductConfiguratorSkeleton';

import styles from './page.module.scss';

export default function Loading() {
  return (
    <>
      <LoadingBar />
      <BackLink />

      <div className={styles.page}>
        <ProductConfiguratorSkeleton />
      </div>
    </>
  );
}
