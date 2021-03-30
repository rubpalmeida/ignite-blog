import Link from 'next/link'

import commonStyles from '../../styles/common.module.scss'
import styels from './header.module.scss'

export default function Header() {
  return (

    <div className={commonStyles.container}>
      <header className={styels.content}>
        <div>
          <Link href="/">
            <a>
              <img src="/logo.svg" alt="logo" />
            </a>
          </Link>
        </div>
      </header>
    </div>
  );
}
