import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { BlurView } from 'expo-blur'
import { colors, radius, shadow, glassBorder, glassHighlight, GLASS_BG, GLASS_BLUR } from '../lib/tokens'
import { Provider, initials, avatarColor, modalityLabel, toArr } from '../lib/types'

type Props = {
  provider: Provider
  onPress: () => void
}


export function ProviderCard({ provider: p, onPress }: Props) {
  const [photoError, setPhotoError] = useState(false)
  const init = initials(p.name)
  const color = avatarColor(p.name)
  const creds = [p.license_type || p.credentials, p.state].filter(Boolean).join(' · ')
  const specs = toArr(p.specialties).slice(0, 3)
  const accepting = p.accepting_clients === true
  const modality = modalityLabel(p)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
      <View style={glassHighlight} />
      <View style={styles.inner}>

        {/* Avatar — outer handles border, inner handles overflow clip */}
        <View style={[styles.avatarOuter, { backgroundColor: color }]}>
          <View style={styles.avatarInner}>
            {p.photo_url && !photoError
              ? <Image source={{ uri: p.photo_url }} style={styles.avatarImg} onError={() => setPhotoError(true)} />
              : <Text style={styles.avatarText}>{init}</Text>
            }
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
          </View>
          <Text style={styles.creds} numberOfLines={1}>{creds}</Text>

          {specs.length > 0 && (
            <View style={styles.tags}>
              {specs.map((s, i) => (
                <View key={s} style={[styles.tag, i === 0 && styles.tagWarm]}>
                  <Text style={[styles.tagText, i === 0 && styles.tagTextWarm]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.meta}>{modality}</Text>
            {accepting
              ? <Text style={styles.accepting}>· Open</Text>
              : <Text style={styles.full}>· Full for now</Text>
            }
          </View>
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
    ...glassBorder,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    backgroundColor: GLASS_BG,
  },

  avatarOuter: {
    width: 52, height: 52, borderRadius: 26,
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInner: {
    width: 46, height: 46, borderRadius: 23,
    overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 18,
    color: 'rgba(255,255,255,0.90)',
  },

  info: { flex: 1, gap: 3 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.ink,
    flex: 1,
  },
  acceptingDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.verified,
    flexShrink: 0,
  },

  creds: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.ink54,
  },

  tags: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 4 },
  tag: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: 'rgba(26,92,90,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(26,92,90,0.18)',
  },
  tagWarm: {
    backgroundColor: 'rgba(160,106,87,0.10)',
    borderColor: 'rgba(160,106,87,0.22)',
  },
  tagText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10.5,
    color: colors.teal,
  },
  tagTextWarm: { color: colors.clay },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.ink54,
  },
  accepting: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.verified,
  },
  full: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.clay,
    opacity: 0.75,
  },

  chevron: {
    fontSize: 22,
    color: colors.ink36,
    marginRight: 2,
  },
})
