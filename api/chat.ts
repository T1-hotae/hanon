import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

// 학사 한눈에 AI 챗봇 프록시.
// OPENAI_API_KEY는 서버(Vercel) 환경변수로만 보관한다. VITE_ 접두어 금지(클라이언트 노출).
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

type KbFaq = { id: string; question: string; answer: string }
type KbNotice = { id: string; title: string; body?: string }
type KbChecklistItem = { label: string; content: string }
type KbContact = { team: string; topic: string; phone: string }
type ChatTurn = { role: 'user' | 'assistant'; content: string }

type RequestBody = {
  categoryLabel?: string
  kb?: {
    faqs?: KbFaq[]
    notices?: KbNotice[]
    checklist?: KbChecklistItem[]
    contacts?: KbContact[]
    phone?: string
    hours?: string
  }
  history?: ChatTurn[]
}

const buildSystemPrompt = (categoryLabel: string, kb: RequestBody['kb']): string => {
  const faqs = (kb?.faqs ?? [])
    .map((f) => `- [${f.id}] Q: ${f.question}\n  A: ${f.answer}`)
    .join('\n')
  const notices = (kb?.notices ?? [])
    .map((n) => `- [${n.id}] ${n.title}${n.body ? `\n  ${n.body}` : ''}`)
    .join('\n')
  const checklist = (kb?.checklist ?? [])
    .map((c) => `- ${c.label}: ${c.content}`)
    .join('\n')
  const contacts = (kb?.contacts ?? [])
    .map((c) => `- ${c.team} · ${c.topic}: ${c.phone}`)
    .join('\n')

  return [
    '당신은 대학교 "학사 한눈에" 서비스의 학사 안내 상담 도우미입니다.',
    `현재 상담 카테고리: ${categoryLabel || '일반'}.`,
    '',
    '규칙:',
    '1) 아래 <자료> 안에 있는 정보로만 답하세요. 자료에 없는 내용은 지어내지 마세요.',
    '2) 자료로 확실히 답할 수 있으면 confident=true로 두고 한국어로 간결하고 친절하게 답하세요.',
    '3) 자료로 답하기 어렵거나 개인 학적·성적 등 민감/개별 확인이 필요하면 confident=false로 두고, "담당자에게 연결해 드릴게요"라는 취지로 answer를 작성하세요.',
    '4) 답변 근거가 된 공지가 있으면 그 대괄호 id를 relatedNoticeIds에 담으세요(없으면 빈 배열).',
    '5) 학사 안내와 무관한 요청은 정중히 거절하고 confident=false로 두세요.',
    '6) 전화 문의가 더 정확한 질문이면 [담당 부서 연락처]의 부서명과 번호를 그대로 안내하세요. 목록에 없는 번호는 지어내지 마세요.',
    '',
    '<자료>',
    kb?.hours ? `운영 시간: ${kb.hours}` : '',
    faqs ? `\n[자주 묻는 질문]\n${faqs}` : '',
    notices ? `\n[공지]\n${notices}` : '',
    checklist ? `\n[신청 전 체크리스트]\n${checklist}` : '',
    contacts ? `\n[담당 부서 연락처]\n${contacts}` : (kb?.phone ? `\n문의 전화: ${kb.phone}` : ''),
    '</자료>',
  ]
    .filter(Boolean)
    .join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST만 허용됩니다.' })
    return
  }
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY가 서버에 설정되지 않았습니다.' })
    return
  }

  try {
    const body = (req.body ?? {}) as RequestBody
    const history = (body.history ?? []).slice(-10)
    if (history.length === 0) {
      res.status(400).json({ error: '대화 내용이 비어 있습니다.' })
      return
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      messages: [
        { role: 'system', content: buildSystemPrompt(body.categoryLabel ?? '', body.kb) },
        ...history,
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'academic_answer',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              answer: { type: 'string', description: '학생에게 보여줄 한국어 답변' },
              confident: { type: 'boolean', description: '자료로 확실히 답했으면 true' },
              relatedNoticeIds: { type: 'array', items: { type: 'string' } },
            },
            required: ['answer', 'confident', 'relatedNoticeIds'],
          },
        },
      },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as {
      answer?: string
      confident?: boolean
      relatedNoticeIds?: string[]
    }

    res.status(200).json({
      answer: String(parsed.answer ?? '답변을 생성하지 못했습니다.'),
      confident: Boolean(parsed.confident),
      relatedNoticeIds: Array.isArray(parsed.relatedNoticeIds) ? parsed.relatedNoticeIds : [],
    })
  } catch (error) {
    console.error('AI 응답 실패', error)
    res.status(500).json({ error: 'AI 응답 생성에 실패했습니다.' })
  }
}
