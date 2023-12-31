import type { PlasmoMessaging } from '@plasmohq/messaging'

const handler: PlasmoMessaging.PortHandler<ImageType[]> = async (req, res) => {
  for (const image of req.body) {
    try {
      await chrome.downloads.download({
        filename: image.storagePath,
        url: image.previewPath,
        saveAs: false
      })
    } catch (error) {
      console.error(error)
    }
  }
}

export default handler
