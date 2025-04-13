import AppHead from "@/components/AppHead";
import styles from "@/styles/Home.module.css";
import validateYouTubeUrl from "@/utils/validators/youTubeUrlFormat";
import { RedirectToSignIn, useUser, SignOutButton, SignedIn } from "@clerk/nextjs";
import axios from "axios";

import { useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

type ApiError = string;

interface FormFieldsInterface {
  urlInput: string
}

export default function Home() {
  const { isSignedIn, user } = useUser();
  console.log('user', user)

  const { register, handleSubmit, formState: { errors } } = useForm<FormFieldsInterface>();
  const [ summaryLoading, setSummaryLoading ] = useState(false);
  const [ downloadLoading, setDownloadLoading ] = useState(false);
  const [ emailLoading, setEmailLoading ] = useState(false);
  const [summary, setSummary] = useState();
  const [apiError, setApiError] = useState<ApiError | undefined>();

  const submit = async(data: FormFieldsInterface) => {
    setSummaryLoading(true)

    try {
      const res = await axios.post("/api/generateSummary", { url: data.urlInput });
      if (res.data.summary) {
        setSummary(res.data.summary)
      }
     console.log('sss', res)

    } catch (apiError) {
      if ( axios.isAxiosError(apiError) ) {
        setApiError(apiError?.response?.data.error)
      } else {
        setApiError('An unknown error occurred')
      }
    } finally {
      setSummaryLoading(false)
    }
  }

  const downloadAsPDF = async () => {
    setDownloadLoading(true)
    try {
      const res = await axios.post('/api/downloadPDF', { summary })
      if (res) {
    //show toast message downloaded
      }

    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        setApiError(apiError?.response?.data.error)
      } else {
        setApiError('An unknown download error occurred')
      }
    } finally {
      setDownloadLoading(false)
    }
  }


const sendByEmail = async() => {
  setEmailLoading(true)
  try {
    const res = await axios.post('/api/sendByEmail', { summary })
    if (res) {
// show toast message sent
    }
  } catch (apiError) {
    if (axios.isAxiosError(apiError)) {
     setApiError(apiError?.response?.data.error)
    } else {
      setApiError('An unknown email error occurred')
    }
  } finally {
    setEmailLoading(false)
  }
}


  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
  <>
    <AppHead/>
    <div className={styles.page}>
      <header className={styles.header}>
        <h2>Welcome, {user?.firstName || "User"}!</h2>
        <div className={styles.authButtons}>
          <SignOutButton>
            <button className={styles.signOutButton}>Sign Out</button>
          </SignOutButton>
        </div>
      </header>

      <SignedIn>
        <main className={styles.main}>
          <form className={styles.form} onSubmit={handleSubmit(submit)}>
            <label className={styles.label} htmlFor="urlInput">Enter a valid youTube URL to get a synopsis of it</label>
            <input
              className={styles.inputField}
              id="urlInput"
              placeholder="www.youtube.com/watch?v=lXvI_IIhaHg"
              {...register('urlInput',
                {
                  required: 'youTube url is required',
                  validate: validateYouTubeUrl
                })}
              />

            { errors?.urlInput && <span className={styles.errorMessage}>{errors.urlInput.message}</span> }
            { apiError && <span className={styles.errorMessage}>{apiError}</span> }

            <button disabled={summaryLoading} className={styles.submitButton}>
              {summaryLoading ? 'Loading summary...' : 'Generate summary'}
            </button>
          </form>

            { summary && <div className={ styles.buttonGroup }>
                <button
                  onClick={downloadAsPDF}
                  className={styles.downloadButton}
                  disabled={summaryLoading || downloadLoading}
                >
                  { downloadLoading ? 'Loading...' : 'Download as PDF' }
                </button>

                <button
                  onClick={sendByEmail}
                  className={styles.emailButton}
                  disabled={summaryLoading || emailLoading}
                >
                  {emailLoading ? 'Loading...' : 'Send in email'}
                </button>
            </div>
            }
            { summary && <section className={styles.summarySection}>
              <h3>Summary</h3>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </section> }
        </main>
      </SignedIn>
    </div>
  </>
  );
}
