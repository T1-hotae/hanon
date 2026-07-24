import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaqItem } from '../components/FaqItem'
import { Layout } from '../components/Layout'
import { useAcademicData } from '../context/useAcademicData'
import { incrementNoticeView } from '../services/inquiryService'
import { formatViews, markNoticeViewedOnce, sortFaqs } from '../utils/format'
import styles from '../App.module.css'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const { faqEntries, notices } = useAcademicData()
  const [openId, setOpenId] = useState('')
  const query = (searchParams.get('q') ?? '').trim()
  const lower = query.toLocaleLowerCase()
  const faqMatches = sortFaqs(faqEntries).filter(
    (faq) =>
      faq.question.toLocaleLowerCase().includes(lower) ||
      faq.answer.toLocaleLowerCase().includes(lower),
  )
  const noticeMatches = notices
    .filter((notice) => notice.title.toLocaleLowerCase().includes(lower))
    .sort((a, b) => b.postedAt - a.postedAt)
  const hasResults = Boolean(query && (faqMatches.length || noticeMatches.length))

  const handleNoticeClick = (noticeId: string) => {
    if (markNoticeViewedOnce(noticeId)) void incrementNoticeView(noticeId)
  }

  return (
    <Layout>
      <section className={styles.section}>
        <h1>검색 결과</h1>
        <p className={styles.resultMeta}>"{query}" 검색 결과</p>
        {hasResults ? (
          <>
            {faqMatches.length > 0 && (
              <div className={styles.accordion}>
                {faqMatches.map((faq) => (
                  <FaqItem
                    key={faq.id}
                    faq={faq}
                    open={openId === faq.id}
                    onToggle={() => setOpenId(openId === faq.id ? '' : faq.id)}
                  />
                ))}
              </div>
            )}
            {noticeMatches.length > 0 && (
              <div className={styles.searchResults}>
                {noticeMatches.map((notice) => (
                  <a
                    key={notice.id}
                    href={notice.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleNoticeClick(notice.id)}
                  >
                    <span>공지</span>
                    <strong>{notice.title}</strong>
                    <em>{formatViews(notice.viewCount)}</em>
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2>관련 정보를 찾지 못했습니다.</h2>
            <p>다른 검색어를 입력하거나 해당 부서에 전화로 문의하세요.</p>
          </div>
        )}
      </section>
    </Layout>
  )
}
