const fs = require('fs')
const path = require('path')

const OUTPUT_DIRECTORY = path.resolve(__dirname, '../src/assets/vector-group')
const CENTER = { x: 60, y: 62 }
const RADIUS = 31

const clockPositions = {
    D: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    Y: [0, 1, 3, 5, 6, 7, 9, 11],
    YN: [0, 1, 3, 5, 6, 7, 9, 11],
    Z: [0, 1, 2, 4, 5, 6, 7, 8, 10, 11],
    ZN: [0, 1, 2, 4, 5, 6, 7, 8, 10, 11],
    I: [0, 6]
}

const round = value => Number(value.toFixed(2))

const pointAt = (angle, radius = RADIUS) => {
    const radians = angle * Math.PI / 180
    return {
        x: round(CENTER.x + Math.cos(radians) * radius),
        y: round(CENTER.y + Math.sin(radians) * radius)
    }
}

const pointFrom = (origin, angle, distance) => {
    const radians = angle * Math.PI / 180
    return {
        x: round(origin.x + Math.cos(radians) * distance),
        y: round(origin.y + Math.sin(radians) * distance)
    }
}

const terminalText = (point, text) => {
    const anchor = point.x < CENTER.x - 4 ? 'end' : point.x > CENTER.x + 4 ? 'start' : 'middle'
    const baseline = point.y < CENTER.y - 4 ? 0 : point.y > CENTER.y + 4 ? 8 : 3
    return `<text x="${point.x}" y="${round(point.y + baseline)}" text-anchor="${anchor}" class="terminal">${text}</text>`
}

const line = (from, to) => `<path d="M ${from.x} ${from.y} L ${to.x} ${to.y}" class="wire"/>`

const circle = (point, radius = 2.4) => `<circle cx="${point.x}" cy="${point.y}" r="${radius}" class="terminal-dot"/>`

const svgDocument = (name, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" role="img" aria-labelledby="title">
  <title id="title">Vector group ${name}</title>
  <style>
    .wire { fill: none; stroke: #263648; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
    .terminal-dot { fill: #ffffff; stroke: #263648; stroke-width: 1.8; }
    .neutral-dot { fill: #ffffff; stroke: #263648; stroke-width: 2; }
    .terminal { fill: #263648; font: 600 10px Arial, sans-serif; }
    .tap { fill: #263648; }
  </style>
  ${body}
</svg>
`

const threePhaseAngles = clock => {
    const rotation = clock == null ? 0 : clock * 30
    return [-90, 30, 150].map(angle => angle + rotation)
}

const threePhaseLabels = isPrimary => isPrimary ? ['A', 'B', 'C'] : ['a', 'b', 'c']

const drawDelta = clock => {
    const isPrimary = clock == null
    const points = threePhaseAngles(clock).map(angle => pointAt(angle))
    const labels = threePhaseLabels(isPrimary)
    const labelPoints = threePhaseAngles(clock).map(angle => pointAt(angle, RADIUS + 13))
    const polygon = `<path d="M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} Z" class="wire"/>`
    return [
        polygon,
        ...points.map(point => circle(point)),
        ...labelPoints.map((point, index) => terminalText(point, labels[index]))
    ].join('\n  ')
}

const drawStar = (clock, neutral) => {
    const isPrimary = clock == null
    const angles = threePhaseAngles(clock)
    const points = angles.map(angle => pointAt(angle))
    const labelPoints = angles.map(angle => pointAt(angle, RADIUS + 13))
    const labels = threePhaseLabels(isPrimary)
    const neutralLabel = isPrimary ? 'N' : 'n'
    const elements = [
        ...points.map(point => line(CENTER, point)),
        ...points.map(point => circle(point)),
        ...labelPoints.map((point, index) => terminalText(point, labels[index]))
    ]

    if (neutral) {
        elements.push(`<circle cx="${CENTER.x}" cy="${CENTER.y}" r="4" class="neutral-dot"/>`)
        elements.push(`<text x="${CENTER.x + 7}" y="${CENTER.y - 7}" class="terminal">${neutralLabel}</text>`)
    } else {
        elements.push(`<circle cx="${CENTER.x}" cy="${CENTER.y}" r="2.4" class="tap"/>`)
    }

    return elements.join('\n  ')
}

const drawZigzag = (clock, neutral) => {
    const isPrimary = clock == null
    const angles = threePhaseAngles(clock)
    const labels = threePhaseLabels(isPrimary)
    const elements = []

    angles.forEach((angle, index) => {
        const segmentLength = 20
        const elbow = pointFrom(CENTER, angle + 30, segmentLength)
        const end = pointFrom(elbow, angle - 30, segmentLength)
        const labelPoint = pointFrom(end, angle, 13)
        elements.push(`<path d="M ${CENTER.x} ${CENTER.y} L ${elbow.x} ${elbow.y} L ${end.x} ${end.y}" class="wire"/>`)
        elements.push(circle(end))
        elements.push(terminalText(labelPoint, labels[index]))
    })

    if (neutral) {
        elements.push(`<circle cx="${CENTER.x}" cy="${CENTER.y}" r="4" class="neutral-dot"/>`)
        elements.push(`<text x="${CENTER.x + 7}" y="${CENTER.y - 7}" class="terminal">${isPrimary ? 'N' : 'n'}</text>`)
    } else {
        elements.push(`<circle cx="${CENTER.x}" cy="${CENTER.y}" r="2.4" class="tap"/>`)
    }

    return elements.join('\n  ')
}

const drawSinglePhase = clock => {
    const angle = -90 + (clock == null ? 0 : clock * 30)
    const first = pointAt(angle)
    const second = pointAt(angle + 180)
    const firstLabel = pointAt(angle, RADIUS + 14)
    const secondLabel = pointAt(angle + 180, RADIUS + 14)
    const primary = clock == null
    return [
        line(first, second),
        circle(first),
        circle(second),
        terminalText(firstLabel, primary ? 'P1' : '1'),
        terminalText(secondLabel, primary ? 'P2' : '2')
    ].join('\n  ')
}

const drawAutotransformer = () => {
    const angles = threePhaseAngles(null)
    const elements = []
    angles.forEach((angle, index) => {
        const inner = pointAt(angle, 18)
        const tap = pointAt(angle, 27)
        const end = pointAt(angle, 38)
        const labelPoint = pointAt(angle, 51)
        elements.push(line(CENTER, inner))
        elements.push(`<path d="M ${inner.x} ${inner.y} Q ${round(tap.x + 5)} ${round(tap.y - 5)} ${tap.x} ${tap.y} Q ${round(tap.x - 5)} ${round(tap.y + 5)} ${end.x} ${end.y}" class="wire"/>`)
        elements.push(circle(tap, 2.2))
        elements.push(circle(end))
        elements.push(terminalText(labelPoint, ['A/a', 'B/b', 'C/c'][index]))
    })
    elements.push(`<circle cx="${CENTER.x}" cy="${CENTER.y}" r="4" class="neutral-dot"/>`)
    elements.push(`<text x="${CENTER.x + 7}" y="${CENTER.y - 7}" class="terminal">N</text>`)
    return elements.join('\n  ')
}

const drawConnection = (connection, clock) => {
    if (connection === 'D') return drawDelta(clock)
    if (connection === 'Y') return drawStar(clock, false)
    if (connection === 'YN') return drawStar(clock, true)
    if (connection === 'Z') return drawZigzag(clock, false)
    if (connection === 'ZN') return drawZigzag(clock, true)
    if (connection === 'I') return drawSinglePhase(clock)
    if (connection === 'YyNa') return drawAutotransformer()
    throw new Error(`Unsupported vector connection: ${connection}`)
}

const writeSvg = (name, connection, clock = null) => {
    const svg = svgDocument(name, drawConnection(connection, clock))
    fs.writeFileSync(path.join(OUTPUT_DIRECTORY, `${name}.svg`), svg, 'utf8')
}

fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true })

for (const connection of Object.keys(clockPositions)) {
    writeSvg(connection, connection)
    for (const clock of clockPositions[connection]) {
        writeSvg(`${connection}${clock}`, connection, clock)
    }
}

writeSvg('YyNa', 'YyNa')

const expectedCount = Object.values(clockPositions).reduce((count, clocks) => count + clocks.length + 1, 0) + 1
const generatedCount = fs.readdirSync(OUTPUT_DIRECTORY).filter(file => file.endsWith('.svg')).length

if (generatedCount !== expectedCount) {
    throw new Error(`Expected ${expectedCount} SVG files, generated ${generatedCount}`)
}

process.stdout.write(`Generated ${generatedCount} vector-group SVG files in ${OUTPUT_DIRECTORY}\n`)
