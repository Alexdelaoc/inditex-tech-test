import styles from './SearchBar.module.scss';

interface SearchBarProps {
  resultsCount: number;
}

export function SearchBar({ resultsCount }: SearchBarProps) {
  return (
    <div>
      <form role="search" className={styles.form}>
        <label htmlFor="product-search" className="visually-hidden">
          Search for a smartphone
        </label>
        <input
          id="product-search"
          name="search"
          type="search"
          className={styles.input}
          placeholder="Search for a smartphone..."
        />
        <button type="submit">Search</button>
      </form>

      <p className={styles.results}>
        {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
      </p>
    </div>
  );
}
