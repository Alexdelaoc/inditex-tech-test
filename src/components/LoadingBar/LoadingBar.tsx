import styles from './LoadingBar.module.scss';

export function LoadingBar() {
  return (
    <div role="progressbar" aria-label="Loading" className={styles.track}>
      <div className={styles.bar} />
    </div>
  );
}
