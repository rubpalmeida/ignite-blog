import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.loading}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  const amountHeadingWords = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')];
    }

    return [...acc];
  }, []).length

  const amountBodyWords = RichText.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const readingTime = Math.ceil((amountHeadingWords + amountBodyWords) / 200)

  return (
    <>
      <Head>
        <title>{post.data.title} | Ig Blog</title>
      </Head>

      <Header />

      {post.data.banner.url && (
        <section className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </section>
      )}

      <main className={commonStyles.container}>
        <article className={styles.content}>
          <h1>{post.data.title}</h1>

          <div className={styles.info}>
            <span>
              <FiCalendar size={20} color="#BBBBBB" />
              {format(new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                })}
            </span>
            <span>
              <FiUser size={20} color="#BBBBBB" />
              {post.data.author}
            </span>
            <span>
              <FiClock size={20} color="#BBBBBB" />
              {readingTime} min
            </span>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                <h2>{heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}>
                </div>
              </div>
            ))}
          </div>

        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts',)
  ],
    {
      pageSize: 5,
    });

  const paths = posts.results.map(results => {
    return {
      params: {
        slug: results.uid
      },
    };
  });

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
