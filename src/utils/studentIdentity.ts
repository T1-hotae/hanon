// 상담사 연결 시 받는 학생 식별정보(학번·학과·이름)의 정제/검증 규칙.
// 화면(ChatPage)·저장(chatService)이 모두 이 파일만 보도록 해서 규칙을 한 곳에서 관리한다.
import type { Department } from '../types/academic'

// 학번 규칙: 숫자 9자리(예: 202104390). 앞 4자리는 입학연도.
// 편입·대학원 등으로 자릿수 체계가 다르면 이 상수만 바꾸면 된다.
export const STUDENT_NUMBER_LENGTH = 9
const STUDENT_NUMBER_RE = new RegExp(`^[0-9]{${STUDENT_NUMBER_LENGTH}}$`)
// 입학연도 하한. 이보다 이르거나 내년보다 미래면 '경고'만 하고 제출은 막지 않는다(재입학·편입 예외).
const ADMISSION_YEAR_MIN = 1990

// 이름 규칙: 한글 2~6자 또는 영문 2~30자(공백·하이픈·어퍼스트로피 허용).
const KOREAN_NAME_RE = /^[가-힣]{2,6}$/
const ENGLISH_NAME_RE = /^[A-Za-z][A-Za-z '.-]{1,29}$/
const INCOMPLETE_HANGUL_RE = /[ㄱ-ㅎㅏ-ㅣ]/

// 학과 규칙: 목록이 있으면 목록에서만, 없으면 형식만 확인한다.
const DEPARTMENT_MIN_LENGTH = 2
const DEPARTMENT_MAX_LENGTH = 30
const DEPARTMENT_TEXT_RE = /^[가-힣A-Za-z0-9()·\s]+$/

export type StudentIdentityInput = {
  studentName: string
  studentNumber: string
  studentDepartment: string
}

export type StudentIdentity = StudentIdentityInput & {
  // 학과 목록에서 고른 경우의 표준 id. 자유 입력이면 빈 문자열.
  studentDepartmentId: string
}

export type IdentityField = keyof StudentIdentityInput

export type IdentityErrors = Partial<Record<IdentityField, string>>

// 전각 숫자(０-９) → 반각 숫자
const toHalfWidthDigits = (value: string): string =>
  value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))

// 학번: 숫자만 남기고 최대 길이까지 자른다(하이픈·공백 입력 허용).
export const normalizeStudentNumber = (value: string): string =>
  toHalfWidthDigits(value).replace(/[^0-9]/g, '').slice(0, STUDENT_NUMBER_LENGTH)

// 이름/학과: 앞뒤 공백 제거 + 연속 공백 1칸으로.
export const normalizeSpaces = (value: string): string => value.trim().replace(/\s+/g, ' ')

// 학과 비교용 키. 공백·괄호·가운뎃점 등을 지우고 소문자로 맞춘다.
const compact = (value: string): string => value.toLowerCase().replace(/[\s()·・.\-_]/g, '')

// 입력값과 일치하는 학과를 찾는다(정식 명칭·id·별칭 모두 허용).
export const findDepartment = (
  value: string,
  departments: Department[],
): Department | undefined => {
  const key = compact(value)
  if (!key) return undefined
  return departments.find(
    (department) =>
      compact(department.id) === key ||
      compact(department.label) === key ||
      department.aliases.some((alias) => compact(alias) === key),
  )
}

export const validateStudentNumber = (raw: string): string | undefined => {
  const value = normalizeStudentNumber(raw)
  if (!value) return '학번을 입력해 주세요.'
  if (!STUDENT_NUMBER_RE.test(value)) {
    return `학번은 숫자 ${STUDENT_NUMBER_LENGTH}자리입니다. (예: 202104390)`
  }
  return undefined
}

// 형식은 맞지만 입학연도가 상식적인 범위를 벗어난 경우의 안내 문구(제출은 가능).
export const studentNumberWarning = (
  raw: string,
  currentYear: number = new Date().getFullYear(),
): string | undefined => {
  const value = normalizeStudentNumber(raw)
  if (!STUDENT_NUMBER_RE.test(value)) return undefined
  const year = Number(value.slice(0, 4))
  if (year < ADMISSION_YEAR_MIN || year > currentYear + 1) {
    return '입학연도(앞 4자리)를 다시 확인해 주세요.'
  }
  return undefined
}

export const validateStudentName = (raw: string): string | undefined => {
  const value = normalizeSpaces(raw)
  if (!value) return '이름을 입력해 주세요.'
  if (KOREAN_NAME_RE.test(value) || ENGLISH_NAME_RE.test(value)) return undefined
  if (INCOMPLETE_HANGUL_RE.test(value)) return '이름을 완성된 한글로 입력해 주세요.'
  return '이름은 한글 2~6자 또는 영문으로 입력해 주세요.'
}

export const validateStudentDepartment = (
  raw: string,
  departments: Department[],
): string | undefined => {
  const value = normalizeSpaces(raw)
  if (!value) return '학과를 입력해 주세요.'
  // 학과 목록을 불러온 경우에는 목록에 있는 학과만 받는다(관리자 검색·집계를 위해).
  if (departments.length > 0) {
    return findDepartment(value, departments) ? undefined : '목록에 있는 학과를 선택해 주세요.'
  }
  // 목록이 아직 없으면(미시드·오프라인) 형식만 확인하고 통과시킨다.
  if (value.length < DEPARTMENT_MIN_LENGTH || value.length > DEPARTMENT_MAX_LENGTH) {
    return `학과명을 ${DEPARTMENT_MIN_LENGTH}~${DEPARTMENT_MAX_LENGTH}자로 입력해 주세요.`
  }
  if (!DEPARTMENT_TEXT_RE.test(value)) return '학과명에 사용할 수 없는 문자가 있습니다.'
  return undefined
}

export const validateIdentityField = (
  field: IdentityField,
  value: string,
  departments: Department[],
): string | undefined => {
  if (field === 'studentNumber') return validateStudentNumber(value)
  if (field === 'studentName') return validateStudentName(value)
  return validateStudentDepartment(value, departments)
}

// 폼 제출 시 최종 검증 + 저장할 값 정제를 한 번에 처리한다.
export const resolveStudentIdentity = (
  input: StudentIdentityInput,
  departments: Department[],
): { ok: boolean; errors: IdentityErrors; value: StudentIdentity } => {
  const errors: IdentityErrors = {}
  const numberError = validateStudentNumber(input.studentNumber)
  const departmentError = validateStudentDepartment(input.studentDepartment, departments)
  const nameError = validateStudentName(input.studentName)
  if (numberError) errors.studentNumber = numberError
  if (departmentError) errors.studentDepartment = departmentError
  if (nameError) errors.studentName = nameError

  const matched = findDepartment(input.studentDepartment, departments)

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      studentName: normalizeSpaces(input.studentName),
      studentNumber: normalizeStudentNumber(input.studentNumber),
      // 목록에 있으면 정식 명칭으로 저장해 표기를 통일한다.
      studentDepartment: matched?.label ?? normalizeSpaces(input.studentDepartment),
      studentDepartmentId: matched?.id ?? '',
    },
  }
}
