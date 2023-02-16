export declare interface PanelRange {
  start: number
  end: number
  length: () => number
}

export declare interface PanelGrouping {
  join: number
  start: number
  end: number
}

export declare interface PanelTimeline {
  attached: boolean
  follow: boolean
  range: PanelRange
  grouping: PanelGrouping
}

export declare interface FragmentItem {
  hours: string
  minutes: string
  seconds: string
  date: number
  moving: boolean
}

export declare interface Fragment {
  display: boolean
  start: FragmentItem
  end: FragmentItem
}

export declare interface Calendar {
  date: Date | number
}

export declare interface Preview {
  display: boolean
  style: { top: number, left: number }
  time: Date | number
  text: string
  src: string
}
