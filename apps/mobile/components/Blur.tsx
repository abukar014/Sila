import { Platform, View, ViewStyle, StyleProp } from 'react-native'
import { BlurView } from 'expo-blur'

type Props = {
  intensity?: number
  tint?: 'light' | 'dark'
  style?: StyleProp<ViewStyle>
  webColor?: string
}

export function Blur({ intensity = 30, tint = 'light', style, webColor }: Props) {
  if (Platform.OS === 'web') {
    const fallback = webColor ?? (tint === 'dark' ? 'rgba(14,44,42,0.75)' : 'rgba(251,247,239,0.80)')
    return <View style={[style, { backgroundColor: fallback }]} />
  }
  return <BlurView intensity={intensity} tint={tint} style={style} />
}
