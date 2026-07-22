import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from '../App.module.css'

export function Header() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const navigate = useNavigate()

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        문무니
      </Link>
      <form className={styles.searchForm} onSubmit={onSubmit}>
        <input
          aria-label="검색어"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="원문 공지 또는 질문 검색"
        />
        <button type="submit">검색</button>
      </form>
    </header>
  )
}
