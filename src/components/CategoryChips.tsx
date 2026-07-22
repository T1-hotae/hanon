import { Link } from 'react-router-dom'
import { useAcademicData } from '../context/useAcademicData'
import styles from '../App.module.css'

export function CategoryChips({ limitToPrimary = false }: { limitToPrimary?: boolean }) {
  const { categories } = useAcademicData()
  const options = limitToPrimary
    ? categories.filter((category) => category.id !== 'etc')
    : categories

  return (
    <div className={styles.quickGrid} aria-label="자주 찾는 항목 바로가기">
      {options.map((category) => (
        <Link key={category.id} to={`/category/${category.id}`} className={styles.quickChip}>
          <strong>{category.label}</strong>
          <span>{category.description}</span>
        </Link>
      ))}
    </div>
  )
}
