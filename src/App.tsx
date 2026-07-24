import { Navigate, Route, Routes } from 'react-router-dom'
import { AcademicDataProvider } from './context/AcademicDataContext'
import { useAcademicData } from './context/useAcademicData'
import { CategoryPage } from './pages/CategoryPage'
import { ChatPage } from './pages/ChatPage'
import { DirectoryPage } from './pages/DirectoryPage'
import { HomePage } from './pages/HomePage'
import { NoticesPage } from './pages/NoticesPage'
import { SearchPage } from './pages/SearchPage'
import styles from './App.module.css'

function AppRoutes() {
  const { loading } = useAcademicData()

  if (loading) return <div className={styles.loading}>불러오는 중입니다.</div>

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/notices" element={<NoticesPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AcademicDataProvider>
      <AppRoutes />
    </AcademicDataProvider>
  )
}
