export const download = async (images: ImageType[]) => {
  for (const image of images) {
    try {
      await chrome.downloads.download({
        filename: image.storagePath,
        url: image.previewPath,
        saveAs: true
      })
    } catch (error) {
      console.error(error)
    }
  }
}
