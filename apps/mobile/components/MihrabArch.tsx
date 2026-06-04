import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export function MihrabArch({ size = 180, color = 'rgba(245, 239, 230, 0.55)' }: Props) {
  const w = size
  const h = size * 1.32

  // Mihrab: straight sides rise, meet a pointed arch at the top
  const cx = w / 2
  const baseY = h
  const sideTop = h * 0.38       // where the arch curve begins
  const archPeak = h * 0.04      // tip of the pointed arch
  const innerPad = w * 0.13      // inset for inner frame line

  // Outer arch path
  const outer = `
    M ${w * 0.08} ${baseY}
    L ${w * 0.08} ${sideTop}
    Q ${w * 0.08} ${archPeak * 0.5} ${cx} ${archPeak}
    Q ${w * 0.92} ${archPeak * 0.5} ${w * 0.92} ${sideTop}
    L ${w * 0.92} ${baseY}
  `

  // Inner arch path (decorative inner line, inset)
  const inner = `
    M ${w * 0.08 + innerPad} ${baseY * 0.94}
    L ${w * 0.08 + innerPad} ${sideTop + innerPad * 0.6}
    Q ${w * 0.08 + innerPad} ${archPeak + innerPad * 1.1} ${cx} ${archPeak + innerPad * 1.3}
    Q ${w * 0.92 - innerPad} ${archPeak + innerPad * 1.1} ${w * 0.92 - innerPad} ${sideTop + innerPad * 0.6}
    L ${w * 0.92 - innerPad} ${baseY * 0.94}
  `

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <Defs>
        <LinearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      {/* Outer arch */}
      <Path
        d={outer}
        stroke="url(#archGrad)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner decorative line */}
      <Path
        d={inner}
        stroke={color}
        strokeWidth={0.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 4"
        fill="none"
        opacity={0.6}
      />
    </Svg>
  )
}
