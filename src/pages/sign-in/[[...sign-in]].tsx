import AppHead from "@/components/AppHead";
import { SignIn } from '@clerk/nextjs';
import styles from './SignIn.module.css';

export default function Page() {
  return <>
    <AppHead />
      <div className={styles.signInContainer}>
        <SignIn
        appearance={{
          variables: {
            fontSize: "1.2rem"
            },
          elements: {
            rootBox: styles.rootBox,
            cardBox: {
              width: 500,
          }}}}
        />
      </div>
    </>
}