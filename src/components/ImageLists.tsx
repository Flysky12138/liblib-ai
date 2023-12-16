import ArrowDownward from '@mui/icons-material/ArrowDownward'
import CallMade from '@mui/icons-material/CallMade'
import Close from '@mui/icons-material/Close'
import DeleteForever from '@mui/icons-material/DeleteForever'
import Chip from '@mui/joy/Chip'
import IconButton from '@mui/joy/IconButton'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import React from 'react'
import { useWindowSize } from 'react-use'
import { useImmer } from 'use-immer'
import { getPort } from '@plasmohq/messaging/port'
import { cn } from '~lib/cn'
import CustomModal, { CustomModalRefType } from './CustomModal'

interface ImageListsPropsType {
  value: ImageType[]
  onDelete: (payload: number[]) => Promise<void>
}

export default function ImageLists({ value: images, onDelete }: ImageListsPropsType) {
  const imagesModalRef = React.useRef<CustomModalRefType>()

  const [selectImages, setSelectImages] = useImmer<ImageListsPropsType['value']>([])

  const { width } = useWindowSize()

  return (
    <CustomModal
      ref={imagesModalRef}
      dialogProps={{
        layout: 'fullscreen'
      }}
      component={props => (
        <IconButton color="primary" size="sm" variant="outlined" {...props}>
          <CallMade />
        </IconButton>
      )}
    >
      <div className="mb-3 flex justify-end gap-x-3">
        {selectImages.length ? (
          <>
            <IconButton
              color="danger"
              variant="outlined"
              onClick={async () => {
                if (!confirm('确认删除？')) return
                const indexs = selectImages.map(selectImage => images.findIndex(v => v.id == selectImage.id))
                await onDelete(indexs)
                await setSelectImages([])
              }}
            >
              <DeleteForever />
            </IconButton>
            <IconButton
              color="primary"
              variant="outlined"
              onClick={async () => {
                getPort('download').postMessage({ body: selectImages })
                await setSelectImages([])
              }}
            >
              <ArrowDownward />
            </IconButton>
            <span className="w-10" aria-hidden="true"></span>
          </>
        ) : null}
        <IconButton
          variant="outlined"
          onClick={async () => {
            await setSelectImages([])
            imagesModalRef.current?.setOpen(false)
          }}
        >
          <Close />
        </IconButton>
      </div>
      <ImageList variant="masonry" cols={Math.round(width / 200)} gap={16} className="p-2">
        {images.map((image, index) => (
          <ImageListItem key={image.id}>
            <div className="relative">
              <img
                draggable="false"
                className={cn('used cursor-pointer ring-orange-600 ring-offset-1', {
                  ring: selectImages.find(v => v.id == image.id)
                })}
                loading="lazy"
                onClick={() => {
                  setSelectImages(state => {
                    const index = selectImages.findIndex(v => v.id == image.id)
                    index == -1 ? state.push(image) : state.splice(index, 1)
                  })
                }}
                key={index}
                src={image.previewPath}
              />
              <Chip size="sm" color="warning" variant="plain" className="absolute bottom-1 left-1 font-bold">
                {index + 1}
              </Chip>
            </div>
          </ImageListItem>
        ))}
      </ImageList>
    </CustomModal>
  )
}
