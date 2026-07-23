import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { PhoneIcon } from '../components/PhoneIcon'
import { useAcademicData } from '../context/useAcademicData'
import { createPhoneInquiry } from '../services/inquiryService'
import type { CategoryId } from '../types/academic'
import styles from '../App.module.css'

// 학내 부서 전화번호 안내(구내전화 기반). 부서·업무·내선만 표시한다.
export function DirectoryPage() {
  const { categories, contacts } = useAcademicData()
  const [searchParams] = useSearchParams()
  const initialCategory = (searchParams.get('category') as CategoryId | null) ?? 'all'
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>(
    categories.some((category) => category.id === initialCategory) ? initialCategory : 'all',
  )
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return contacts
      .filter((contact) => categoryFilter === 'all' || contact.categories.includes(categoryFilter))
      .filter((contact) => {
        if (!keyword) return true
        return (
          contact.team.toLowerCase().includes(keyword) ||
          contact.topic.toLowerCase().includes(keyword) ||
          contact.ext.toLowerCase().includes(keyword) ||
          contact.phone.toLowerCase().includes(keyword)
        )
      })
      .sort((a, b) => a.order - b.order)
  }, [contacts, categoryFilter, query])

  // 그룹별로 묶어서 보여준다(그룹 등장 순서 유지).
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const contact of filtered) {
      const list = map.get(contact.group) ?? []
      list.push(contact)
      map.set(contact.group, list)
    }
    return [...map.entries()]
  }, [filtered])

  const categoryLabel = (id: CategoryId) =>
    categories.find((category) => category.id === id)?.label ?? id

  const record = (phone: string, team: string, topic: string) => {
    void createPhoneInquiry('etc', `${team} ${topic} 전화 문의`, phone)
  }

  return (
    <Layout>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h1>부서 전화번호 안내</h1>
        </div>
        <p className={styles.directoryHint}>
          학사 관련 부서 연락처입니다. 번호를 누르면 바로 전화가 연결됩니다. (구내 3XXX → 031-280-3XXX)
        </p>

        <div className={styles.tabs} role="tablist" aria-label="카테고리 필터">
          <button
            type="button"
            className={categoryFilter === 'all' ? styles.activeTab : undefined}
            onClick={() => setCategoryFilter('all')}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={categoryFilter === category.id ? styles.activeTab : undefined}
              onClick={() => setCategoryFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <input
          className={styles.directorySearch}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="부서·업무·번호 검색 (예: 학적, 장학, 3542)"
          aria-label="부서 검색"
        />

        {grouped.length === 0 ? (
          <p className={styles.emptyState}>검색 결과가 없습니다.</p>
        ) : (
          grouped.map(([group, groupContacts]) => (
            <div key={group} className={styles.directoryGroup}>
              <h2 className={styles.directoryGroupTitle}>{group}</h2>
              <ul className={styles.contactList}>
                {groupContacts.map((contact) => (
                  <li key={contact.id} className={styles.contactRow}>
                    <div className={styles.contactRowInfo}>
                      <strong>{contact.team}</strong>
                      <span>
                        {contact.topic}
                        {contact.categories.length > 0 &&
                          ` · ${contact.categories.map(categoryLabel).join('·')}`}
                      </span>
                    </div>
                    <a
                      className={styles.contactCall}
                      href={`tel:${contact.phone}`}
                      onClick={() => record(contact.phone, contact.team, contact.topic)}
                    >
                      <PhoneIcon size={15} />
                      <span>{contact.phone}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </Layout>
  )
}
