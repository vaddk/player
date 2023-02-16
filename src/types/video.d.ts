export declare interface Initial {
  width: number
  height: number
}

export declare interface Speed {
  display: boolean
  current: number
  list: number[]
  max: () => number
  min: () => number
}

export declare interface Sound {
  display: boolean
  level: number
}
