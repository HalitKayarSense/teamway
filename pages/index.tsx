import styles from '../styles/main.module.css'
import teamwayLogo from "../public/TeamwayLogo.svg"
import QuestionsBox from '../components/main'
import { useState } from 'react'

import Head from 'next/head'



function Home() {

  const [isStarted, setIsStarted] = useState(false)

  // call this function to start the test
  const start = () => {
    setIsStarted(true);
  }

  return (
    <>
      <Head>
        <title>Teamway | Code test by Halit Kayar</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <br />
      <br />
      <div className={styles['teamway-logo']}>
        <p className={styles['teamway-logo-sub']}>Code test for</p>
        <img src={teamwayLogo.src} />
        <p className={styles['teamway-logo-sub-small']}>by Halit Kayar</p>
      </div>
      <br />
      <div className={styles['main-box']}>
        {/* once start function is called, show questions ( test ) component */}
        {isStarted ? <QuestionsBox /> :
          <>
            <div className={styles['landing-box']}>
              <div className={styles['landing-header']}>
                Are you an introvert or an extrovert?
              </div>
              <div className={styles['landing-content']}>
                So do you consider yourself more of an introvert or an extrovert? Take this test, put together with input from psychoanalyst Sandrine Dury, and find out
              </div>
              <button className={styles['start-button']} onClick={() => start()}>
                START TEST
              </button>
            </div>
          </>
        }
      </div>
    </>
  )
}


export default Home


