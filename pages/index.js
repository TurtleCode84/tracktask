import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>TrackTask - Shareable Task Management</title>
        <meta name="description" content="TrackTask: Shareable task management, made easier." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <a href="https://tracktask.vercel.app">TrackTask</a> - Shareable Task Management
        </h1>

        <p className={styles.description}>
          Coming soon, powered by{' '}
          <code className={styles.code}>Express.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://github.com/TurtleCode84" className={styles.card}>
            <h2>Find me on GitHub &rarr;</h2>
            <p>View my GitHub profile, public projects, and more.</p>
          </a>

          <a href="https://nextjs.org" className={styles.card}>
            <h2>Learn about Next.js &rarr;</h2>
            <p>Check out everything about Next.js on its website!</p>
          </a>

          <a
            href="#"
            className={styles.card}
          >
            <h2>Become a beta tester &rarr;</h2>
            <p>Find out how to become a TrackTask Beta tester.</p>
          </a>

          <a
            href="https://tracktask.vercel.app/api"
            className={styles.card}
          >
            <h2>Try the API &rarr;</h2>
            <p>
              Click here to see an example of an API response.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Express.js and{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
