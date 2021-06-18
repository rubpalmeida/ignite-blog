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
import Link from 'next/link';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  last_publication_time: string | null;
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
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      }
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      }
    }[];
  }
}

export default function Post({ post, navigation, preview }: PostProps): JSX.Element {
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
              {post.first_publication_date}
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

          {post.first_publication_date !== post.last_publication_date && (
            <div className={styles.editadeInfo}>
              <span>{`* editado em ${post.last_publication_date}, às ${post.last_publication_time}`}</span>
            </div>
          )}

          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                <h2>{heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}>
                </div>
              </div>
            ))}
          </div>

          <section className={`${commonStyles.container} ${styles.navigation}`}>

            {navigation?.prevPost.length > 0 && (
              <div>
                <h3>{navigation.prevPost[0].data.title}</h3>
                <Link href={`/post/${navigation.prevPost[0].uid}`} >
                  <a>Post anterior</a>
                </Link>
              </div>
            )}

            {navigation?.nextPost.length > 0 && (
              <div>
                <h3>{navigation.nextPost[0].data.title}</h3>
                <Link href={`/post/${navigation.nextPost[0].uid}`} >
                  <a>Próximo post</a>
                </Link>
              </div>
            )}


          </section>

          <Comments />

          {preview && (
            <aside className={styles.exitPreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData
}) => {

  const { slug } = params
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]'
    }
  )

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]'
    }
  )

  const post = {
    uid: response.uid,
    first_publication_date: format(new Date(response.first_publication_date), "dd MMM yyyy", { locale: ptBR }),
    last_publication_date: format(new Date(response.last_publication_date), "dd MMM yyyy", { locale: ptBR }),
    last_publication_time: format(new Date(response.last_publication_date), "HH:mm", { locale: ptBR }),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }

  return {
    props: {
      post,
      preview,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      }
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
