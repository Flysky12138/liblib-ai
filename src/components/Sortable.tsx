import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { cn } from '~lib/cn'

interface SortablePropsType {
  id: number
  className?: string
  draggingClassName?: string
  children: React.ReactNode
}

export default function Sortable({ id, className, draggingClassName, children }: SortablePropsType) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'cursor-grab',
        {
          'z-50 cursor-grabbing': isDragging,
          [draggingClassName]: isDragging
        },
        className
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </section>
  )
}
