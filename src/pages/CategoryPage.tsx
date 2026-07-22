import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FaqItem } from '../components/FaqItem'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { PhoneIcon } from '../components/PhoneIcon'
import { primaryTabs } from '../constants'
import { useAcademicData } from '../context/useAcademicData'
import { getCategory, type CategoryId } from '../types/academic'
import { sortFaqs, sortNoticesByViews } from '../utils/format'
import styles from '../App.module.css'

export function CategoryPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { categories, checklists, faqEntries, notices } = useAcademicData()
  const categoryId = params.id as CategoryId
  const category = getCategory(categoryId, categories)
  const [modalOpen, setModalOpen] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(searchParams.get('open') ?? '')

  if (!categories.some((item) => item.id === categoryId)) return <Navigate to="/" replace />

  const faqs = sortFaqs(faqEntries.filter((faq) => faq.category === categoryId))
  const checklist = checklists.find((item) => item.category === categoryId)
  const categoryNotices = sortNoticesByViews(notices.filter((notice) => notice.category === categoryId))

  return (
    <Layout>
      <nav className={styles.topTabs} aria-label="주요 학사 항목">
        {primaryTabs.map((tab) => (
          <Link
            key={tab.id}
            to={`/category/${tab.id}`}
            aria-current={tab.id === categoryId ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <section className={styles.categoryTopGrid}>
        <div className={styles.categoryTopLeft}>
          <section className={styles.categoryHero}>
            <div>
              <p className={styles.eyebrow}>빠른 항목</p>
              <h1>{category.label}</h1>
              <p>{category.description}</p>
            </div>
          </section>
        </div>

        {checklist && (
          <aside className={styles.checklistPanel}>
            <h2>신청 전 체크</h2>
            <ul className={styles.checklistList}>
              {checklist.items.map((item) => (
                <li key={item.id} className={styles.checklistRow}>
                  <span className={styles.checklistBox} aria-hidden="true" />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.section}>
          <h2>가장 많이 묻는 질문</h2>
          <div className={styles.accordion}>
            {faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                open={openFaqId === faq.id}
                onToggle={() => setOpenFaqId(openFaqId === faq.id ? '' : faq.id)}
              />
            ))}
          </div>
        </div>
        <aside className={styles.section}>
          <h2>자주 찾는 원문 공지</h2>
          <NoticeList notices={categoryNotices} />
        </aside>
      </section>

      <button
        type="button"
        className={styles.phoneCta}
        onClick={() => setModalOpen(true)}
        aria-label={`${category.label} 문의 전화 연결`}
      >
        <span className={styles.phoneCtaButton}>
          <PhoneIcon />
        </span>
        <span className={styles.phoneCtaText}>
          <strong>{category.label} 전화 문의</strong>
          <span>전화로 바로 연결하기</span>
        </span>
      </button>

      {modalOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setModalOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>{category.label} 문의 전화</h2>
            <p className={styles.phoneNumber}>{category.phone}</p>
            <p>{category.hours}</p>
            <div className={styles.modalActions}>
              <a href={`tel:${category.phone}`}>전화 걸기</a>
              <button type="button" onClick={() => setModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
