import { Storage } from '@plasmohq/storage'
import { STORAGE } from './keys'

export const getToken = async () => {
  const storage = new Storage({ area: 'local' })
  return await storage.get(STORAGE.TOKEN)
}
