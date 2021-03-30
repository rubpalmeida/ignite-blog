import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link';

import Prismic from '@prismicio/client'
import Head from 'next/head';

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale';

import { useEffect, useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from '../styles/home.module.scss';


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
  postsPagination: PostPagination,
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([])
  const [nextPage, setNextPage] = useState('')

  useEffect(() => {
    setPosts(postsPagination.results)
    setNextPage(postsPagination.next_page)
  }, [postsPagination.results, postsPagination.next_page])

  function loadMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const nextPagePost = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author
            },
          };
        });

        setPosts([...posts, ...nextPagePost]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | Ig Blog</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.content}>
          <img src="/logo.svg" alt="logo" />

          <div className={styles.post}>
            {posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a href="#">
                  <strong>{post.data.title}</strong>
                  <h2>{post.data.subtitle}</h2>
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
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {nextPage && (
            <button
              className={styles.loadMorePostsButton}
              type="button"
              onClick={loadMorePosts}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 5,
  });

  const next_page = postsResponse.next_page

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      },
    };
  })

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts
      }
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
