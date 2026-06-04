import { View, ViewStyle, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { colors, radius, shadow } from '../lib/tokens'

type Props = {
  children: React.ReactNode
  style?: ViewStyle
  intensity?: number
  tint?: 'light' | 'dark'
  noBorder?: boolean
}

export function GlassCard({ children, style, intensity = 40, tint = 'light', noBorder = false }: Props) {
  return (
    <View style={[styles.outer, shadow.card, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={[styles.inner, !noBorder && styles.border]}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.glassPaper,
  },
  border: {
    borderWidth: 1,
    borderColor: colors.glassWhite,
  },
})
