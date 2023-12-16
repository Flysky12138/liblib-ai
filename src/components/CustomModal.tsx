import Modal, { ModalProps } from '@mui/joy/Modal'
import ModalDialog, { ModalDialogProps } from '@mui/joy/ModalDialog'
import ModalOverflow from '@mui/joy/ModalOverflow'
import React from 'react'
import { useToggle } from 'react-use'

interface CustomModalPropsType extends Omit<ModalProps, 'children' | 'open' | 'onClose' | 'onClose'> {
  component?: React.FunctionComponent<{
    onClick: () => void
  }>
  children?: React.ReactNode | React.FunctionComponent<CustomModalRefType>
  dialogProps?: ModalDialogProps
  disabled?: boolean
}

export interface CustomModalRefType {
  setOpen: (payload?: boolean) => void
}

export default React.forwardRef<CustomModalRefType, CustomModalPropsType>(function CustomModal(
  { children, component: Component, dialogProps, disabled, ...props },
  ref
) {
  const [isOpen, isOpenToggle] = useToggle(false)

  React.useImperativeHandle(ref, () => ({
    setOpen: isOpenToggle
  }))

  const pointerDownTarget = React.useRef<HTMLElement>()

  return (
    <>
      {Component && <Component onClick={isOpenToggle} />}
      <Modal
        open={isOpen}
        onClose={(event, reason) => {
          if (disabled) return
          if (reason == 'backdropClick') {
            if (Reflect.get(event, 'target') != pointerDownTarget.current) return
          }
          isOpenToggle()
        }}
        {...props}
      >
        <ModalOverflow
          onPointerDown={event => {
            event.stopPropagation()
            pointerDownTarget.current = event.target as HTMLElement
          }}
        >
          <ModalDialog {...dialogProps}>
            {typeof children == 'function'
              ? children({
                  setOpen: isOpenToggle
                })
              : children}
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  )
})
