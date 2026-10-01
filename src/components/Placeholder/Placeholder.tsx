import styles from './Placeholder.module.scss';

export function Placeholder({ className }: { className?: string }) {
  return <span className={className ? `${styles.placeholder} ${className}` : styles.placeholder} />;
}
