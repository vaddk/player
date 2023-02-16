export declare interface ZoomCoords {
  x: number
  y: number
}

export declare interface ZoomCoorsLast extends ZoomCoords {
  scale: number
}

export declare interface ZoomPinch extends ZoomCoords {
  origin: number | ZoomCoords
}

export declare interface ZoomScale {
  min: number
  max: number
  current: number
}
