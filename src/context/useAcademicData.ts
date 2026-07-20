import { useContext } from 'react'
import { AcademicDataContext } from './academicDataContextObject'

export const useAcademicData = () => {
  const context = useContext(AcademicDataContext)
  if (!context) {
    throw new Error('useAcademicData must be used within AcademicDataProvider')
  }
  return context
}
