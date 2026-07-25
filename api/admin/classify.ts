import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { requireAdmin } from './_auth'

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

type Category = { id: string; label: string; description?: string }
type ExistingTopic = { topic: string; topicKey: string; categoryId: string }
type InquiryInput = {
  id: string
  categoryId: string
  keyword: string
  detail?: string
  source?: 'chat' | 'phone'
}

type RequestBody = {
  categories?: Category[]
  existingTopics?: ExistingTopic[]
  inquiries?: InquiryInput[]
}

const setCors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
}

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')

const buildPrompt = (body: Required<RequestBody>) => {
  const categories = body.categories
    .map((category) => `- ${category.id}: ${category.label}${category.description ? ` (${category.description})` : ''}`)
    .join('\n')
  const existingTopics = body.existingTopics.length > 0
    ? body.existingTopics
      .map((topic) => `- ${topic.categoryId}/${topic.topicKey}: ${topic.topic}`)
      .join('\n')
    : '- 없음'
  const inquiries = body.inquiries
    .map((inquiry) => [
      `- id: ${inquiry.id}`,
      `  categoryId: ${inquiry.categoryId}`,
      `  source: ${inquiry.source ?? 'chat'}`,
      `  keyword: ${inquiry.keyword}`,
      inquiry.detail ? `  detail: ${inquiry.detail}` : '',
    ].filter(Boolean).join('\n'))
    .join('\n')

  return [
    '대학교 학사 상담 문의를 운영 통계용 주제로 분류하세요.',
    '',
    '규칙:',
    '1) 같은 의도의 질문은 반드시 같은 topic/topicKey로 묶으세요.',
    '2) existingTopics에 의미가 맞는 주제가 있으면 새 주제를 만들지 말고 그 topic/topicKey를 재사용하세요.',
    '3) topic은 관리자가 보는 한국어 명사구로 짧게 쓰세요. 예: "전과 신청 기간", "장학금 지급일".',
    '4) topicKey는 영어 소문자 snake_case로 쓰세요. 예: "transfer_application_period".',
    '5) categoryId는 기존 categoryId가 명백히 틀린 경우에만 더 적절한 카테고리 id로 바꾸세요.',
    '6) 애매하면 너무 세분화하지 말고 넓은 주제로 묶으세요.',
    '',
    '<categories>',
    categories,
    '</categories>',
    '',
    '<existingTopics>',
    existingTopics,
    '</existingTopics>',
    '',
    '<inquiries>',
    inquiries,
    '</inquiries>',
  ].join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST만 허용됩니다.' })
    return
  }
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY가 서버에 설정되지 않았습니다.' })
    return
  }

  try {
    await requireAdmin(req)

    const rawBody = (req.body ?? {}) as RequestBody
    const body: Required<RequestBody> = {
      categories: Array.isArray(rawBody.categories) ? rawBody.categories.slice(0, 100) : [],
      existingTopics: Array.isArray(rawBody.existingTopics) ? rawBody.existingTopics.slice(0, 200) : [],
      inquiries: Array.isArray(rawBody.inquiries) ? rawBody.inquiries.slice(0, 50) : [],
    }

    if (body.categories.length === 0 || body.inquiries.length === 0) {
      res.status(400).json({ error: '카테고리와 문의 목록이 필요합니다.' })
      return
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: '당신은 학사 상담 운영 통계를 정리하는 한국어 분류 도우미입니다.' },
        { role: 'user', content: buildPrompt(body) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'inquiry_topic_classification',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    categoryId: { type: 'string' },
                    topic: { type: 'string' },
                    topicKey: { type: 'string' },
                    confidence: { type: 'number' },
                  },
                  required: ['id', 'categoryId', 'topic', 'topicKey', 'confidence'],
                },
              },
            },
            required: ['results'],
          },
        },
      },
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{"results":[]}') as {
      results?: Array<{ id?: string; categoryId?: string; topic?: string; topicKey?: string; confidence?: number }>
    }
    const inputIds = new Set(body.inquiries.map((inquiry) => inquiry.id))
    const categoryIds = new Set(body.categories.map((category) => category.id))
    const results = (parsed.results ?? [])
      .filter((item) => item.id && inputIds.has(item.id) && item.topic)
      .map((item) => {
        const fallback = body.inquiries.find((inquiry) => inquiry.id === item.id)
        const categoryId = item.categoryId && categoryIds.has(item.categoryId)
          ? item.categoryId
          : fallback?.categoryId ?? body.categories[0].id
        const topic = String(item.topic ?? '').trim()
        const topicKey = normalizeKey(String(item.topicKey ?? '')) || normalizeKey(topic) || 'general_inquiry'
        return {
          id: String(item.id),
          categoryId,
          topic,
          topicKey,
          confidence: Number(item.confidence ?? 0),
        }
      })

    res.status(200).json({ results })
  } catch (error) {
    console.error('문의 주제 분류 실패', error)
    res.status(401).json({ error: error instanceof Error ? error.message : '문의 주제 분류에 실패했습니다.' })
  }
}
