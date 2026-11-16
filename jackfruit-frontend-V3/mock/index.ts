import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { resolve, type MockRequest } from './handlers'

/**
 * 开发期 Mock 服务：以 Vite 中间件形式挂载在 /api 下。
 *
 * 为什么不用 MSW / json-server：
 *   - 零额外依赖，随 dev server 启停，生产构建里根本不包含这段代码
 *   - 直接复用 src/types/raw.ts 做类型约束，mock 形状与后端契约绑定
 *
 * 开启方式：.env.development 里 VITE_USE_MOCK=true
 */
const MOCK_PREFIX = '/api'

type ParsedBody = {
  body: Record<string, string>
  files: Record<string, { filename: string; size: number }>
}

function parseMultipart(raw: Buffer, boundary: string): ParsedBody {
  const body: Record<string, string> = {}
  const files: Record<string, { filename: string; size: number }> = {}
  if (!boundary) return { body, files }

  const text = raw.toString('utf8')
  for (const segment of text.split(`--${boundary}`)) {
    const splitIndex = segment.indexOf('\r\n\r\n')
    if (splitIndex === -1) continue

    const headers = segment.slice(0, splitIndex)
    const nameMatch = /name="([^"]+)"/.exec(headers)
    if (!nameMatch) continue

    let value = segment.slice(splitIndex + 4)
    if (value.endsWith('\r\n')) value = value.slice(0, -2)

    const filenameMatch = /filename="([^"]*)"/.exec(headers)
    if (filenameMatch) {
      // mock 不需要文件内容，只记录"传了哪个字段"
      files[nameMatch[1]] = { filename: filenameMatch[1], size: Buffer.byteLength(value) }
    } else {
      body[nameMatch[1]] = value
    }
  }
  return { body, files }
}

function readBody(req: IncomingMessage): Promise<ParsedBody> {
  return new Promise((done) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('error', () => done({ body: {}, files: {} }))
    req.on('end', () => {
      const raw = Buffer.concat(chunks)
      if (!raw.length) return done({ body: {}, files: {} })

      const contentType = String(req.headers['content-type'] ?? '')

      if (contentType.includes('multipart/form-data')) {
        const matched = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType)
        return done(parseMultipart(raw, matched?.[1] ?? matched?.[2] ?? ''))
      }

      const text = raw.toString('utf8')
      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(text) as Record<string, unknown>
          const body: Record<string, string> = {}
          for (const [key, value] of Object.entries(parsed)) body[key] = String(value)
          return done({ body, files: {} })
        } catch {
          return done({ body: {}, files: {} })
        }
      }

      return done({ body: Object.fromEntries(new URLSearchParams(text)), files: {} })
    })
  })
}

function sendJson(res: ServerResponse, payload: unknown): void {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

const delay = (ms: number): Promise<void> =>
  new Promise((done) => {
    setTimeout(done, ms)
  })

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // connect 挂载在 /api 后会剥掉前缀，req.url 此时形如 /user/login?username=admin
  const [pathname, search = ''] = (req.url ?? '/').split('?')
  const { body, files } = await readBody(req)

  const payload: MockRequest = {
    method: req.method ?? 'GET',
    path: pathname.replace(/\/+$/, '') || '/',
    query: Object.fromEntries(new URLSearchParams(search)),
    body,
    files,
  }

  // 模拟真实网络延迟，便于观察 loading 态
  await delay(80 + Math.floor(Math.random() * 120))

  const result = resolve(payload)
  const flag = result.status_code === 0 ? 'ok  ' : 'fail'
  console.log(`[mock] ${flag} ${payload.method} ${payload.path} ${result.message}`)

  sendJson(res, result)
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'jackfruit-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(MOCK_PREFIX, (req, res) => {
        void handle(req, res)
      })
      console.log('[mock] 已启用内存 Mock 接口（数据随 dev server 重启重置）')
    },
  }
}
