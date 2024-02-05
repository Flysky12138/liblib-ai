import { Storage } from '@plasmohq/storage'
import { STORAGE } from '~lib/keys'

const LIBLIB_URL = 'https://www.liblib.art'

// 点击图标
chrome.action.onClicked.addListener(async $tab => {
  const storage = new Storage({ area: 'local' })
  const token = await storage.get(STORAGE.TOKEN)
  const id = await chrome.runtime.id
  if (!token || $tab.url.includes(id)) {
    await chrome.tabs.create({ url: LIBLIB_URL })
    return
  }
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.url.includes(id)) {
      await chrome.tabs.update(tab.id, { active: true })
      return
    }
  }
  await chrome.tabs.create({ url: './tabs/index.html' })
})

// 拦截生成图请求的请求体并存储
chrome.webRequest.onBeforeRequest.addListener(
  // @ts-ignore
  async ({ requestBody, frameType }) => {
    if (frameType != 'sub_frame') return
    const body = new TextDecoder().decode(requestBody.raw[0].bytes)
    if (!body) return
    const storage = new Storage({ area: 'local' })
    const data = (await storage.get<StorageType['generateImageBody'][] | null>(STORAGE.GENERATE_IMAGE_BODY)) || []
    data.unshift({
      time: Date.now(),
      body: JSON.parse(body)
    })
    await storage.set(STORAGE.GENERATE_IMAGE_BODY, data.slice(0, 20))
  },
  { urls: ['https://liblib-api.vibrou.com/gateway/sd-api/generate/image'] },
  ['requestBody']
)

// 右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'clear-generate-task-id',
    title: '解决长时间等待状态',
    contexts: ['action']
  })
  chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
    if (menuItemId != 'clear-generate-task-id') return
    const storage = new Storage({ area: 'local' })
    storage.set(STORAGE.GENERATE_TASK_ID, 0)
  })
})
