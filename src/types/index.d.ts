interface StorageType {
  generateImageBody: {
    time: number
    body: {
      checkpointId: number
      generateType: number
      frontCustomerReq: {
        frontId: string
        windowId: string
        tabType: string
        conAndSegAndGen: string
      }
      text2img: {
        prompt: string
        negativePrompt: string
        extraNetwork: string
        samplingMethod: number
        samplingStep: number
        width: number
        height: number
        batchCount: number
        batchSize: number
        cfgScale: number
        seed: number
        seedExtra: number
        hiResFix: number
        restoreFaces: number
        tiling: number
        clipSkip: number
      } | null
      adetailerEnable: number
      additionalNetwork: Array<{
        modelId: number
        type: number
        weight: number
        modelName: string
        modelVersionName: string
      }> | null
      taskQueuePriority: number
    }
  }
  item: {
    id: number
    body: string
    image?: string
    name?: string
  }
}

interface ImageType {
  id: number
  previewPath: string
  storagePath: string
  illegal: number
  imageInfo: string
  script: number
  isScript: number
}

interface GenerateProgressResponse {
  code: number
  msg: string
  data: {
    frontCustomerReq: {
      frontId: string
      windowId: string
      tabType: string
      conAndSegAndGen: string
    }
    errCode: null
    userId: number
    uuid: null
    generateId: number
    subType: number
    subStatus: number
    statusMsg: null
    totalStep: number
    currentSteps: number
    percentCompleted: number | null
    timeTaken: number
    estTimeLeft: number
    images: ImageType[] | null
    saveStatus: boolean
    image2Txt: null
    generateSubId: null
    queueStatus: number
    queueName: null
    power: number
    taskQueuePriority: number
    queueNum: number | null
    subTypeName: string
    totalQueueNum: number | null
    extraType: number
  }
}
