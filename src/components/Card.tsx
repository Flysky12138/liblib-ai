import Add from '@mui/icons-material/Add'
import Clear from '@mui/icons-material/Clear'
import Edit from '@mui/icons-material/Edit'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import Textarea from '@mui/joy/Textarea'
import React from 'react'
import { useImmer } from 'use-immer'
import CustomModal, { CustomModalRefType } from './CustomModal'

interface CardPropsType {
  onDelete: () => void
  onEdit: (payload: CardPropsType['value']) => void
  value: StorageType['item']
  endDecorator?: React.ReactNode
}

export default function Card({ onDelete, onEdit, value, endDecorator }: CardPropsType) {
  const [editCahce, setEditCache] = useImmer<CardPropsType['value']>({ body: '', id: -1, image: '', name: '' })

  const validatedEditCacheBody = React.useMemo(() => {
    try {
      JSON.parse(editCahce.body)
      return true
    } catch (error) {
      return false
    }
  }, [editCahce.body])

  const modaEditlRef = React.useRef<CustomModalRefType>()
  const fileInputID = React.useId()

  return (
    <section className="group relative aspect-[9/16] overflow-hidden rounded-[inherit] border bg-slate-100 transition-colors hover:border-slate-300">
      <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton color="danger" variant="solid" size="sm" onPointerDown={event => event.stopPropagation()} onClick={onDelete}>
          <Clear />
        </IconButton>
      </div>
      <div className="absolute right-2 top-2 flex flex-col gap-y-2 opacity-0 transition-opacity group-hover:opacity-100">
        <CustomModal
          ref={modaEditlRef}
          component={({ onClick }) => (
            <IconButton
              color="primary"
              variant="solid"
              size="sm"
              onPointerDown={event => event.stopPropagation()}
              onClick={() => {
                setEditCache(value)
                onClick()
              }}
            >
              <Edit />
            </IconButton>
          )}
        >
          <div className="grid w-[60vw] max-w-screen-lg grid-cols-[1fr_260px] gap-5">
            <FormControl className="grow">
              <FormLabel>名字</FormLabel>
              <Input
                value={editCahce.name}
                onChange={event => {
                  setEditCache(state => {
                    state.name = event.target.value
                  })
                }}
              />
            </FormControl>
            <FormControl className="row-span-2">
              <FormLabel>封面</FormLabel>
              {/* @ts-ignore */}
              <IconButton
                variant="outlined"
                component="label"
                htmlFor={fileInputID}
                className="h-full overflow-hidden"
                onClick={event => {
                  if (!editCahce.image) return
                  event.preventDefault()
                  setEditCache(state => {
                    state.image = undefined
                    return state
                  })
                }}
              >
                <input
                  id={fileInputID}
                  className="hidden"
                  aria-hidden="true"
                  type="file"
                  onChange={event => {
                    const reader = new FileReader()
                    reader.readAsDataURL(event.target.files[0])
                    reader.onloadend = () => {
                      setEditCache(state => {
                        state.image = reader.result as string
                        return state
                      })
                      event.target.value = null
                    }
                  }}
                />
                {editCahce.image ? (
                  <div className="group absolute inset-0">
                    <div className="absolute inset-0 hidden place-content-center backdrop-blur-sm group-hover:grid ">
                      <IconButton color="danger" variant="solid" className="rounded-full">
                        <Clear />
                      </IconButton>
                    </div>
                    <img src={editCahce.image} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <Add />
                )}
              </IconButton>
            </FormControl>
            <FormControl error={!validatedEditCacheBody}>
              <FormLabel>请求体</FormLabel>
              <Textarea
                spellCheck="false"
                minRows={15}
                maxRows={15}
                value={editCahce.body}
                onChange={event =>
                  setEditCache(state => {
                    state.body = event.target.value
                  })
                }
              />
            </FormControl>
            <Button
              size="lg"
              className="col-start-2"
              disabled={!validatedEditCacheBody}
              onClick={() => {
                onEdit(editCahce)
                modaEditlRef.current?.setOpen(false)
              }}
            >
              保存
            </Button>
          </div>
        </CustomModal>
        {endDecorator}
      </div>
      {value.image ? (
        <img src={value.image} className="h-full w-full object-cover" />
      ) : (
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base">无封面</p>
      )}
      {value.name && (
        <div className="absolute inset-x-2 bottom-2">
          <Chip color="primary" variant="outlined" className="max-w-full overflow-hidden">
            {value.name}
          </Chip>
        </div>
      )}
    </section>
  )
}
