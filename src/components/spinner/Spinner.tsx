import { LucideLoaderCircle } from "lucide-react";
import styles from './Spinner.module.css'
const Spinner = () => {
  return (
    <div
      role="status"
      className={styles.spinnerContainer}
    >
      <LucideLoaderCircle className={styles.spinnerIcon} />
    </div>
  );
};

export { Spinner };