import { ZoomInMap, ZoomOutMap } from '@mui/icons-material'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import DeleteForever from '@mui/icons-material/DeleteForever'
import Chip from '@mui/joy/Chip'
import IconButton from '@mui/joy/IconButton'
import React from 'react'
import { useSet, useWindowSize } from 'react-use'
import { cn } from '~lib/cn'
import { download } from '~lib/download'
import CustomModal, { CustomModalRefType } from './CustomModal'

interface ImageListsPropsType {
  value: ImageType[]
  onDelete: (payload: number[]) => Promise<void>
}

export default function ImageLists({ value: images, onDelete }: ImageListsPropsType) {
  const imagesModalRef = React.useRef<CustomModalRefType>()

  const [selectImageIds, setSelectImageIds] = useSet<ImageListsPropsType['value'][0]['id']>()

  const { width } = useWindowSize()

  return (
    <CustomModal
      ref={imagesModalRef}
      dialogProps={{
        layout: 'fullscreen'
      }}
      component={props => (
        <IconButton color="primary" size="sm" variant="outlined" {...props}>
          <ZoomOutMap />
        </IconButton>
      )}
      onKeyDown={event => {
        if (event.metaKey || event.ctrlKey) {
          if (event.key.toLowerCase() == 'a') {
            event.preventDefault()
            for (const { id } of images) {
              setSelectImageIds.add(id)
            }
          }
        }
      }}
    >
      <div className="mb-3 flex justify-end gap-x-3">
        {selectImageIds.size > 0 ? (
          <>
            <IconButton
              color="danger"
              variant="outlined"
              onClick={async () => {
                if (!confirm('确认删除？')) return
                await onDelete(Array.from(selectImageIds))
                setSelectImageIds.reset()
              }}
            >
              <DeleteForever />
            </IconButton>
            <IconButton
              color="primary"
              variant="outlined"
              onClick={async () => {
                await download(Array.from(selectImageIds).map(id => images.find(image => image.id == id)))
                await onDelete(Array.from(selectImageIds))
                setSelectImageIds.reset()
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
            setSelectImageIds.reset()
            imagesModalRef.current?.setOpen(false)
          }}
        >
          <ZoomInMap />
        </IconButton>
      </div>
      <div
        className="grid gap-4 p-2"
        style={{
          gridTemplateColumns: `repeat(${Math.round(width / 200)}, minmax(0, 1fr))`
        }}
      >
        {images.map((image, index) => (
          <div className="relative" key={image.id}>
            <img
              draggable="false"
              className={cn('cursor-pointer ring-orange-600 ring-offset-1', {
                ring: selectImageIds.has(image.id)
              })}
              loading="lazy"
              decoding="async"
              onClick={event => {
                if (event.shiftKey && selectImageIds.size > 0) {
                  const firstSelectImagesIndex = images.findIndex(v => v.id == Array.from(selectImageIds)[0])
                  setSelectImageIds.reset()
                  for (const { id } of images.slice(Math.min(firstSelectImagesIndex, index), Math.max(firstSelectImagesIndex, index) + 1)) {
                    setSelectImageIds.add(id)
                  }
                  return
                }
                setSelectImageIds.toggle(image.id)
              }}
              key={index}
              src={image.previewPath}
              onLoad={event => {
                const target = event.target as HTMLImageElement
                target.nextElementSibling.classList.remove('hidden')
              }}
            />
            <Chip size="sm" color="warning" variant="plain" className="absolute bottom-1 left-1 hidden font-bold">
              {index + 1}
            </Chip>
          </div>
        ))}
      </div>
    </CustomModal>
  )
}
