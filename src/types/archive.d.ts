declare type MissingFragments = Array<{ start: string | number; end: string | number }>

export declare interface Camera {
  name: string
  host: string
  token: string
  dToken: string
  src: string
  srcType: string
  width: number
  height: number
  thumbnails: boolean
  blocked: boolean
  codec: string
  dvrDepth: number
  realTime: number
}

export declare interface Quality {
  display: boolean
  list: string[]
  current: string
}

export declare interface ArchiveDate {
  live: number
  start: number
  end: number
  last: number
  current: number
  load: number
  hour: number
  offset: number
  serverOffset: number
  url: number
}

export declare interface Fragment {
  start: string | number
  end: string | number
}

// vis-data types for DataSet dont work, so its any...
export declare interface Fragments {
  data: any
  missing: MissingFragments
  motion: any[]
  index: number
  clear: () => void
}

export declare interface RangeItem {
  year: number
  month: number
  day: number
  hour: number
  time: number
}

export declare interface RangeParts {
  start: RangeItem
  end: RangeItem
  offset: number
}
