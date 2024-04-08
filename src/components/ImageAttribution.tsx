import type { MouseEvent, ReactElement } from 'react'
import type { IFruit } from 'types'

interface Properties {
  author: IFruit['image']['author']
}

function onClick(event: MouseEvent): void {
  event.stopPropagation()
}

export default function ImageAttribution({ author }: Properties): ReactElement {
  return (
    <>
      <div className='absolute top-0 h-full w-full bg-gradient-to-b from-transparent via-transparent to-current text-black text-opacity-50' />
      <div className='absolute bottom-1 right-1 px-1 text-xs text-white'>
        <span>Photo by </span>
        <a
          className='underline'
          data-testid='FruitImageAuthor'
          href={author.url}
          onClick={onClick}
          rel='noreferrer noopener'
          target='_blank'
        >
          {author.name}
        </a>
        <span> on </span>
        <a
          className='underline'
          href='https://unsplash.com'
          onClick={onClick}
          rel='noreferrer noopener'
          target='_blank'
        >
          Unsplash
        </a>
      </div>
    </>
  )
}
