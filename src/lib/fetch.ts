import { getToken } from './token'

export const generateImage = async (body: string) => {
  try {
    const res = await fetch('https://liblib-api.vibrou.com/gateway/sd-api/generate/image', {
      headers: {
        'Content-Type': 'application/json',
        Token: await getToken()
      },
      method: 'POST',
      body
    })
    const data: { code: number; msg: string; data: number } = await res.json()
    if (data.code != 0) throw data.msg
    return data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const generateProgress = async (id: number) => {
  try {
    const res = await fetch(`https://liblib-api.vibrou.com/gateway/sd-api/generate/progress/msg/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Token: await getToken()
      },
      method: 'POST',
      body: JSON.stringify({})
    })
    const data: GenerateProgressResponse = await res.json()
    if (data.code != 0) throw data.msg
    return data
  } catch (error) {
    return Promise.reject(error)
  }
}
