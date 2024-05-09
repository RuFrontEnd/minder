enum Type {
    terminator = 'terminator',
    process = 'process',
    data = 'data',
    decision = 'decision',

}
type ShapeId = string
type Title = string
type Vec = { x: number, y: number }
type W = number
type H = number
type CurveD = {
    p1: {
        x: Vec['x'],
        y: Vec['y'],
    },
    p2: {
        x: Vec['x'],
        y: Vec['y'],
    },
    cp1: {
        x: Vec['x'],
        y: Vec['y'],
    },
    cp2: {
        x: Vec['x'],
        y: Vec['y'],
    },
    sendTo: ShapeId
    text: null | string
}

export { Type }
export type { ShapeId, Title, Vec, W, H, CurveD }