interface StorageType {
  generateImageBody: {
    time: number
    body: object
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
    percentCompleted: null | number
    timeTaken: number
    estTimeLeft: number
    images: null | ImageType[]
    saveStatus: boolean
    image2Txt: null
    generateSubId: null
    queueStatus: number
    queueName: null
    power: number
    taskQueuePriority: number
    queueNum: null | number
    subTypeName: string
    totalQueueNum: null | number
    extraType: number
  }
}
