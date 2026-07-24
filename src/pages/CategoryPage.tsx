import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FaqItem } from '../components/FaqItem'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { PhoneIcon } from '../components/PhoneIcon'
import { useAcademicData } from '../context/useAcademicData'
import { createPhoneInquiry } from '../services/inquiryService'
import { getCategory, type CategoryId } from '../types/academic'
import { sortFaqs, sortNoticesByViews } from '../utils/format'
import styles from '../App.module.css'

export function CategoryPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { categories, checklists, contacts, faqEntries, notices } = useAcademicData()
  const categoryId = params.id as CategoryId
  const category = getCategory(categoryId, categories)
  const [modalOpen, setModalOpen] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(searchParams.get('open') ?? '')

  if (!categories.some((item) => item.id === categoryId)) return <Navigate to="/" replace />

  const faqs = sortFaqs(faqEntries.filter((faq) => faq.category === categoryId))
  const checklist = checklists.find((item) => item.category === categoryId)
  const categoryNotices = sortNoticesByViews(notices.filter((notice) => notice.category === categoryId))

  // 이 카테고리의 담당 부서 연락처. 모달에는 대표(priority 1)만 노출하고, 없으면 카테고리 연락처를 사용한다.
  const categoryContacts = contacts
    .filter((contact) => contact.categories.includes(categoryId))
    .sort((a, b) => a.order - b.order)
  const featuredContacts = categoryContacts.filter((contact) => contact.priority === 1)
  const modalContacts = featuredContacts.length ? featuredContacts : categoryContacts

  const recordPhoneInquiry = (phone: string, topic?: string) => {
    void createPhoneInquiry(categoryId, `${category.label} 전화 문의${topic ? ` · ${topic}` : ''}`, phone)
  }

  return (
    <Layout>
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
            {modalContacts.length > 0 ? (
              <>
                <ul className={styles.contactList}>
                  {modalContacts.map((contact) => (
                    <li key={contact.id} className={styles.contactRow}>
                      <div className={styles.contactRowInfo}>
                        <strong>{contact.team}</strong>
                        <span>{contact.topic}</span>
                      </div>
                      <a
                        className={styles.contactCall}
                        href={`tel:${contact.phone}`}
                        onClick={() => recordPhoneInquiry(contact.phone, `${contact.team} ${contact.topic}`)}
                      >
                        <PhoneIcon size={15} />
                        <span>{contact.phone}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                {category.hours && <p className={styles.contactHours}>{category.hours}</p>}
                <Link className={styles.contactDirectoryLink} to={`/directory?category=${categoryId}`}>
                  전체 부서 연락처 보기 →
                </Link>
              </>
            ) : category.phone ? (
              <>
                <p className={styles.phoneNumber}>{category.phone}</p>
                {category.hours && <p>{category.hours}</p>}
                <div className={styles.modalActions}>
                  <a href={`tel:${category.phone}`} onClick={() => recordPhoneInquiry(category.phone)}>전화 걸기</a>
                </div>
              </>
            ) : (
              <p>등록된 담당 부서 연락처가 없습니다.</p>
            )}
            <div className={styles.modalActions}>
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
