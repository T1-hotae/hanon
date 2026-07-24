import { useState } from 'react'
import { FaqItem } from './FaqItem'
import { NoticeList } from './NoticeList'
import { PhoneIcon } from './PhoneIcon'
import { useAcademicData } from '../context/useAcademicData'
import { createPhoneInquiry } from '../services/inquiryService'
import { getCategory, type CategoryId } from '../types/academic'
import { sortFaqs, sortNoticesByViews } from '../utils/format'
import styles from '../App.module.css'

const FAQ_LIMIT = 5
const NOTICE_LIMIT = 5

// 채팅 옆(데스크톱 오른쪽)에 붙는 정보 패널.
// 폐기된 CategoryPage의 요소(신청 전 체크·FAQ·원문 공지·연락처)를 대화 맥락 옆에서 함께 보여준다.
export function ChatInfoPanel({ categoryId }: { categoryId: CategoryId }) {
  const { categories, checklists, contacts, faqEntries, notices } = useAcademicData()
  const category = getCategory(categoryId, categories)
  const checklist = checklists.find((item) => item.category === categoryId)
  const [openFaqId, setOpenFaqId] = useState('')

  const faqs = sortFaqs(faqEntries.filter((faq) => faq.category === categoryId)).slice(0, FAQ_LIMIT)
  const categoryNotices = sortNoticesByViews(
    notices.filter((notice) => notice.category === categoryId),
  ).slice(0, NOTICE_LIMIT)

  // 대표(priority 1) 연락처만 노출하고, 없으면 카테고리 전체 연락처를 사용한다.
  const categoryContacts = contacts
    .filter((contact) => contact.categories.includes(categoryId))
    .sort((a, b) => a.order - b.order)
  const featuredContacts = categoryContacts.filter((contact) => contact.priority === 1)
  const shownContacts = featuredContacts.length ? featuredContacts : categoryContacts

  const recordPhoneInquiry = (phone: string, topic?: string) => {
    void createPhoneInquiry(categoryId, `${category.label} 전화 문의${topic ? ` · ${topic}` : ''}`, phone)
  }

  return (
    <aside className={styles.chatInfoPanel} aria-label={`${category.label} 안내 정보`}>
      {checklist && (
        <section className={styles.chatInfoBlock}>
          <h3>신청 전 체크</h3>
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
        </section>
      )}

      {faqs.length > 0 && (
        <section className={styles.chatInfoBlock}>
          <h3>자주 묻는 질문</h3>
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
        </section>
      )}

      {categoryNotices.length > 0 && (
        <section className={styles.chatInfoBlock}>
          <h3>자주 찾는 원문 공지</h3>
          <NoticeList notices={categoryNotices} />
        </section>
      )}

      {shownContacts.length > 0 && (
        <section className={styles.chatInfoBlock}>
          <h3>{category.label} 문의 전화</h3>
          <ul className={styles.contactList}>
            {shownContacts.map((contact) => (
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
        </section>
      )}
    </aside>
  )
}
