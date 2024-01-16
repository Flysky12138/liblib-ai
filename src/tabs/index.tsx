import { DndContext } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { ExitToApp, Output } from '@mui/icons-material'
import Telegram from '@mui/icons-material/Telegram'
import { ButtonGroup } from '@mui/joy'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import LinearProgress from '@mui/joy/LinearProgress'
import Typography from '@mui/joy/Typography'
import { produce } from 'immer'
import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useAsyncFn, useInterval } from 'react-use'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import Card from '~components/Card'
import CustomModal from '~components/CustomModal'
import ImageLists from '~components/ImageLists'
import Sortable from '~components/Sortable'
import '~globals.css'
import { cn } from '~lib/cn'
import { exportConfig, importConfig } from '~lib/config'
import { generateImage, generateProgress } from '~lib/fetch'
import { STORAGE } from '~lib/keys'

const title = 'Liblib Ai'

export default function App() {
  const instance = new Storage({ area: 'local' })

  // 存储数据
  const [generateImageBodys, setGenerateImageBodys] = useStorage<StorageType['generateImageBody'][]>({ key: STORAGE.GENERATE_IMAGE_BODY, instance }, [])
  const [items, setItems] = useStorage<StorageType['item'][]>({ key: STORAGE.ITEMS, instance }, [])
  const [images, setImages] = useStorage<ImageType[]>({ key: STORAGE.IMAGES, instance }, [])

  const toastID = React.useRef('0')
  const [generateTaskID, setGenerateTaskID] = useStorage<number>({ key: STORAGE.GENERATE_TASK_ID, instance }, 0)
  const fetchOptions = React.useRef<{ body: StorageType['item']['body']; times: number; timesTotal: number }>({
    body: '',
    times: 1,
    timesTotal: 1
  })

  // 图片生成请求
  const [{ loading }, doGenerateImageFetch] = useAsyncFn(async () => {
    const { data } = await toast.promise(generateImage(fetchOptions.current.body), {
      error: error => error,
      loading: 'Loading',
      success: '请求成功'
    })
    if (data) {
      await setGenerateTaskID(data)
      window.document.title = `【${fetchOptions.current.times}/${fetchOptions.current.timesTotal}】${title}`
    }
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
            className="bg-slate-200 text-zinc-700 ring"
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
        if (++fetchOptions.current.times <= fetchOptions.current.timesTotal) {
          await doGenerateImageFetch()
        } else {
          window.document.title = title
        }
      }
    } catch (error) {
      console.error(error)
      window.document.title = title
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
    <main className="grid h-screen grid-cols-[1fr_220px] overflow-hidden">
      <Toaster containerClassName="text-base" />
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
                              defaultValue={fetchOptions.current.timesTotal}
                              slotProps={{
                                input: { min: 1 }
                              }}
                              onChange={event => {
                                fetchOptions.current.times = 1
                                fetchOptions.current.timesTotal = Math.max(1, Number.parseInt(event.target.value || '0'))
                              }}
                              type="number"
                              onFocus={event => event.target.select()}
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
      <div className="flex flex-col border-l">
        <div className="flex h-12 items-center border-b bg-slate-200 px-5">
          <ButtonGroup color="primary">
            <IconButton onClick={importConfig}>
              <ExitToApp />
            </IconButton>
            <IconButton onClick={exportConfig}>
              <Output />
            </IconButton>
          </ButtonGroup>
          <span aria-hidden="true" className="grow"></span>
          <ImageLists
            value={images}
            onDelete={async ids => {
              await setImages(produce(state => state.filter(({ id }) => !ids.includes(id))))
            }}
          />
        </div>
        <div className="flex grow flex-col items-center gap-y-3 overflow-y-auto bg-stone-100 py-5">
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
                      state.unshift({
                        id: Date.now(),
                        body: JSON.stringify(body, null, '  '),
                        name: body.additionalNetwork?.reduce((pre, cur) => pre.concat(cur.modelName), []).join(' & ') || ''
                      })
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
        <p className="border-t bg-stone-100 py-1 text-center">左键：添加；右键：删除</p>
      </div>
    </main>
  )
}
