import { PlasmoCSConfig } from 'plasmo'
import React from 'react'
import { Storage } from '@plasmohq/storage'
import { STORAGE } from '~lib/keys'

export const config: PlasmoCSConfig = {
  matches: ['https://www.liblib.art/']
}

export default function Content() {
  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) alert('请登陆。如果已经登陆，请联系作者。')
    const storage = new Storage({ area: 'local' })
    storage.set(STORAGE.TOKEN, token)
  }, [])

  return null
}
