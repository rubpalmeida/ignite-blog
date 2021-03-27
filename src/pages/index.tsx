import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from '../styles/home.module.scss';

import Head from 'next/head';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  // TODO
  return (
    <div className={commonStyles.container}>
      <Head>
        <title>Ig Blog | Home</title>
      </Head>

      <div className={styles.content}>
        <img src="/logo.svg" alt="logo" />

        <main>
          <div className={styles.post}>
            <h1>Como Utilizar Hooks</h1>
            <h2>Pensando em sincronização em vez de ciclos de vida</h2>
            <div className={styles.info}>
              <p>
                <i><FiCalendar /></i>
                <span>15 Mar 2021</span>
              </p>
              <p>
                <i><FiUser /></i>
                <span>Joseph Oliveira</span>
              </p>
            </div>
          </div>

          <div className={styles.post}>
            <h1>Criando um app CRA do zero</h1>
            <h2>Tudo sobre como criar a sua primeira aplicação utilizando Crate React App</h2>
            <div className={styles.info}>
              <p>
                <i><FiCalendar /></i>
                <span>15 Feb 2021</span>
              </p>
              <p>
                <i><FiUser /></i>
                <span>Danilo Vieira</span>
              </p>
            </div>
          </div>

        </main>

        <button className={styles.btnLoadMorePosts} type="button">
          Carregar mais posts
        </button>
      </div>
    </div>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
