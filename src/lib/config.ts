import { Storage } from '@plasmohq/storage'
import { STORAGE } from './keys'

export const exportConfig = async () => {
  if (!window.confirm('备份')) return

  const storage = new Storage({ area: 'local' })
  const data = await storage.getAll()

  const blob = new Blob([JSON.stringify(data, null, '  ')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = Object.assign(document.createElement('a'), {
    download: 'liblib-ai.config.json',
    href: url
  })

  a.click()

  URL.revokeObjectURL(url)
}

export const importConfig = async () => {
  if (!window.confirm('导入备份，覆盖还原')) return

  const input = Object.assign(document.createElement('input'), {
    type: 'file',
    accept: '.json'
  })

  input.addEventListener('input', async event => {
    const target = event.target as HTMLInputElement
    const data = JSON.parse(await target.files[0].text())

    const storage = new Storage({ area: 'local' })
    for (const [key, value] of Object.entries<string>(data)) {
      // @ts-ignore
      if (!Object.values(STORAGE).includes(key)) continue
      await storage.set(key, JSON.parse(value))
    }
  })

  input.click()
}
