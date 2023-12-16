import { DndContext } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import HelpOutline from '@mui/icons-material/HelpOutline'
import Telegram from '@mui/icons-material/Telegram'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import LinearProgress from '@mui/joy/LinearProgress'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import { produce } from 'immer'
import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useAsyncFn, useInterval } from 'react-use'
import { getPort } from '@plasmohq/messaging/port'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import Card from '~components/Card'
import CustomModal from '~components/CustomModal'
import ImageLists from '~components/ImageLists'
import Sortable from '~components/Sortable'
import '~globals.css'
import { cn } from '~lib/cn'
import { generateImage, generateProgress } from '~lib/fetch'
import { STORAGE } from '~lib/keys'

export default function App() {
  const instance = new Storage({ area: 'local' })

  // 存储数据
  const [generateImageBodys, setGenerateImageBodys] = useStorage<StorageType['generateImageBody'][]>({ key: STORAGE.GENERATE_IMAGE_BODY, instance }, [])
  const [items, setItems] = useStorage<StorageType['item'][]>({ key: STORAGE.ITEMS, instance }, [])
  const [images, setImages] = useStorage<ImageType[]>({ key: STORAGE.IMAGES, instance }, [])

  const toastID = React.useRef('0')
  const [generateTaskID, setGenerateTaskID] = useStorage<number>({ key: STORAGE.GENERATE_TASK_ID, instance }, 0)
  const fetchOptions = React.useRef<{ body: StorageType['item']['body']; times: number }>({
    body: '',
    times: 1
  })

  // 图片生成请求
  const [{ loading }, doGenerateImageFetch] = useAsyncFn(async () => {
    const { data } = await toast.promise(generateImage(fetchOptions.current.body), {
      error: error => error,
      loading: 'Loading',
      success: '请求成功'
    })
    setGenerateTaskID(data)
  })

  // 图片生成状态轮询
  useInterval(async () => {
    if (!generateTaskID) return
    try {
      const { data } = await generateProgress(generateTaskID)
      toastID.current = toast.custom(
        <div className="pointer-events-none w-[500px]">
          <LinearProgress
            determinate
            variant="plain"
            className="bg-slate-200"
            color="neutral"
            value={data.percentCompleted || 0}
            sx={{ '--LinearProgress-thickness': '30px' }}
          >
            <Typography level="body-md" fontWeight="xl" textColor="common.white" sx={{ mixBlendMode: 'difference' }}>
              {data.queueNum ? `排队中，第 ${data.queueNum} 位。` : `LOADING… ${data.percentCompleted}%`}
            </Typography>
          </LinearProgress>
        </div>,
        {
          id: toastID.current,
          position: 'top-center'
        }
      )
      if (data.images) {
        toast.success('生成成功')
        await setGenerateTaskID(0)
        await setImages(
          produce(state => {
            state.unshift(...data.images)
          })
        )
        toast.remove(toastID.current)
        getPort('download').postMessage({ body: data.images })
        if (fetchOptions.current.times-- > 1) {
          await doGenerateImageFetch()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }, 2000)

  const token = useStorage({ key: STORAGE.TOKEN, instance }, null)
  if (!token) {
    return (
      <div className="grid h-full -translate-y-20 place-content-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
        TOKEN 获取不到，请登陆。若已登陆请联系作者
      </div>
    )
  }

  return (
    <main className="grid h-full grid-cols-[220px_1fr] overflow-hidden">
      <Toaster containerClassName="text-base" />
      <div className="border-r">
        <div className="flex h-12 items-center justify-between border-b bg-slate-200 px-5">
          <Tooltip
            title={
              <>
                <p>左键：添加</p>
                <p>右键：删除</p>
              </>
            }
            arrow
            placement="right-end"
          >
            <IconButton size="sm" variant="outlined">
              <HelpOutline />
            </IconButton>
          </Tooltip>
          <ImageLists
            value={images}
            onDelete={async payload => {
              await setImages(
                produce(state => {
                  for (const index of payload) {
                    if (index != -1) state.splice(index, 1)
                  }
                })
              )
            }}
          />
        </div>
        <div className="flex h-[calc(100vh-theme(height.12))] flex-col items-center gap-y-3 overflow-y-auto bg-stone-100 py-5">
          {generateImageBodys.length ? (
            generateImageBodys.map(({ time, body }, index) => (
              <Chip
                key={time}
                color="primary"
                variant="outlined"
                size="lg"
                className="relative cursor-pointer select-none overflow-hidden hover:bg-blue-100"
                onClick={async () => {
                  setGenerateImageBodys(state => {
                    state.splice(index, 1)
                    return state
                  })
                  await setItems(
                    produce(state => {
                      state.unshift({ id: Date.now(), body: JSON.stringify(body, null, '  ') })
                    })
                  )
                }}
                onContextMenu={event => {
                  event.preventDefault()
                  setGenerateImageBodys(
                    produce(state => {
                      state.splice(index, 1)
                    })
                  )
                }}
              >
                {new Date(time).toLocaleString()}
              </Chip>
            ))
          ) : (
            <div className="grid h-full -translate-y-20 place-content-center text-base">无生成图的请求记录 ಠ_ಠ</div>
          )}
        </div>
      </div>
      <DndContext
        onDragEnd={event => {
          const { active, over } = event
          if (active.id == over.id) return
          setItems(state => {
            const oldIndex = state.findIndex(item => item.id == active.id)
            const newIndex = state.findIndex(item => item.id == over.id)
            return arrayMove(state, oldIndex, newIndex)
          })
        }}
      >
        <SortableContext items={items}>
          <div className="grid h-full w-full grid-cols-1 items-start gap-4 overflow-y-auto overflow-x-hidden p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {items.map((item, index) => (
              <Sortable key={item.id} id={item.id} className="rounded-lg" draggingClassName="shadow-lg">
                <Card
                  value={item}
                  onDelete={async () => {
                    if (!confirm('确认删除？')) return
                    await setItems(
                      produce(state => {
                        state.splice(index, 1)
                      })
                    )
                  }}
                  onEdit={async payload => {
                    await setItems(
                      produce(state => {
                        state.splice(index, 1, payload)
                      })
                    )
                  }}
                  endDecorator={
                    <CustomModal
                      component={props => (
                        <IconButton
                          color="success"
                          variant="solid"
                          size="sm"
                          className={cn({
                            hidden: loading || generateTaskID
                          })}
                          onPointerDown={event => event.stopPropagation()}
                          {...props}
                        >
                          <Telegram />
                        </IconButton>
                      )}
                    >
                      {({ setOpen }) => (
                        <>
                          <FormControl>
                            <FormLabel>运行次数</FormLabel>
                            <Input
                              defaultValue={fetchOptions.current.times}
                              slotProps={{
                                input: { min: 1 }
                              }}
                              onChange={event => {
                                fetchOptions.current.times = Math.max(1, Number.parseInt(event.target.value || '0'))
                              }}
                              type="number"
                            />
                          </FormControl>
                          <Button
                            className="mt-4"
                            onClick={async () => {
                              fetchOptions.current.body = item.body
                              await doGenerateImageFetch()
                              setOpen(false)
                            }}
                          >
                            开始生图
                          </Button>
                        </>
                      )}
                    </CustomModal>
                  }
                />
              </Sortable>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  )
}
