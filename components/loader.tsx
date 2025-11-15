import React from 'react'
import { TextShimmer } from './ui/text-shimmer'

export default function Loader (props:any) {
  return (

<div className="min-h-screen w-full flex items-center justify-center">    <TextShimmer
      duration={1.2}
      className='text-xl text-center tjustify-center items-center font-sans font-medium [--base-color:black] [--base-gradient-color:darkgray] dark:[--base-color:white] dark:[--base-gradient-color:lightgray]'
    >
      {props.text}
    </TextShimmer>
    </div>

  )
}
