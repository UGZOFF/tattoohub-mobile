import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import { useUIStore } from '../../stores/ui.store'
import { useBookingStore } from '../../stores/booking.store'
import { Colors, Shadows } from '../../constants/colors'
import { Button } from '../../components/ui/Button'
import { TATTOO_STYLES, BODY_ZONES } from '../../constants/typography'

const TIMES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00']
const DURATIONS = [60, 90, 120, 180, 240, 300, 360]

function getDatesArray(count: number) {
  const dates = []
  for (let i = 1; i <= count; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

export default function BookingScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>()
  const { session } = useAuthStore()
  const { showToast } = useUIStore()
  const { draft, setDraft, resetDraft } = useBookingStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const { data: artist } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const { data } = await supabase.from('artists').select('*').eq('id', artistId).single()
      return data
    },
  })

  const dates = getDatesArray(28)
  const ratePerHour = artist?.hourly_rate ?? 100
  const total = Math.round((draft.durationMinutes / 60) * ratePerHour)
  const deposit = Math.round(total * 0.30)

  const handleConfirm = async () => {
    if (!session) { router.push('/(onboarding)/auth'); return }
    if (!draft.date || !draft.timeSlot) { showToast('Choisis une date et un créneau', 'error'); return }
    setLoading(true)
    const { data: booking, error } = await supabase.from('bookings').insert({
      client_id: session.user.id,
      artist_id: artistId,
      date: draft.date,
      time_slot: draft.timeSlot,
      duration_minutes: draft.durationMinutes,
      style: draft.style,
      body_zone: draft.bodyZone,
      description: draft.description,
      reference_images: draft.referenceImages,
      total_amount: total,
      deposit_amount: deposit,
      status: 'pending',
    }).select().single()
    setLoading(false)
    if (error) { showToast(error.message, 'error'); return }
    resetDraft()
    showToast('Réservation envoyée ! L\'artiste va confirmer.', 'success')
    router.replace(`/chat/${booking.id}`)
  }

  if (!artist) return null

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} accessibilityLabel="Retour">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réserver · {artist.stage_name}</Text>
        <View style={styles.stepper}>
          {[1,2,3].map(n => <View key={n} style={[styles.stepDot, step >= n && styles.stepDotActive]} />)}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Étape 1 : Date & Heure */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Date & Heure</Text>

            <Text style={styles.label}>Choisis une date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
              {dates.map(d => {
                const iso = d.toISOString().split('T')[0]
                const isSelected = draft.date === iso
                return (
                  <TouchableOpacity key={iso} style={[styles.dateCard, isSelected && styles.dateCardActive]} onPress={() => setDraft({ date: iso })} accessibilityRole="radio" accessibilityState={{ selected: isSelected }}>
                    <Text style={[styles.dateDow, isSelected && styles.dateDowActive]}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</Text>
                    <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>{d.getDate()}</Text>
                    <Text style={[styles.dateMon, isSelected && styles.dateMonActive]}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <Text style={styles.label}>Créneau</Text>
            <View style={styles.timesGrid}>
              {TIMES.map(t => (
                <TouchableOpacity key={t} style={[styles.timeBtn, draft.timeSlot === t && styles.timeBtnActive]} onPress={() => setDraft({ timeSlot: t })} accessibilityRole="radio" accessibilityState={{ selected: draft.timeSlot === t }}>
                  <Text style={[styles.timeText, draft.timeSlot === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Durée estimée : <Text style={styles.labelVal}>{draft.durationMinutes / 60}h</Text></Text>
            <View style={styles.durationsRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity key={d} style={[styles.durBtn, draft.durationMinutes === d && styles.durBtnActive]} onPress={() => setDraft({ durationMinutes: d })} accessibilityRole="radio" accessibilityState={{ selected: draft.durationMinutes === d }}>
                  <Text style={[styles.durText, draft.durationMinutes === d && styles.durTextActive]}>{d / 60}h</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Étape 2 : Détails */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ton projet</Text>

            <Text style={styles.label}>Style souhaité</Text>
            <View style={styles.stylesGrid}>
              {TATTOO_STYLES.map(s => (
                <TouchableOpacity key={s} style={[styles.stylePill, draft.style === s && styles.stylePillActive]} onPress={() => setDraft({ style: s })} accessibilityRole="radio" accessibilityState={{ selected: draft.style === s }}>
                  <Text style={[styles.stylePillText, draft.style === s && styles.stylePillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Zone du corps</Text>
            <View style={styles.stylesGrid}>
              {BODY_ZONES.map(z => (
                <TouchableOpacity key={z} style={[styles.stylePill, draft.bodyZone === z && styles.stylePillActive]} onPress={() => setDraft({ bodyZone: z })} accessibilityRole="radio" accessibilityState={{ selected: draft.bodyZone === z }}>
                  <Text style={[styles.stylePillText, draft.bodyZone === z && styles.stylePillTextActive]}>{z}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Décris ton projet</Text>
            <TextInput
              style={styles.textarea}
              value={draft.description ?? ''}
              onChangeText={v => setDraft({ description: v })}
              placeholder="Taille, style, références, idées..."
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              accessibilityLabel="Description du projet"
            />
          </View>
        )}

        {/* Étape 3 : Récap */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Récapitulatif</Text>
            <View style={styles.recapCard}>
              {[
                { label: 'Artiste', val: artist.stage_name },
                { label: 'Date', val: draft.date ? new Date(draft.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) : '–' },
                { label: 'Heure', val: draft.timeSlot ?? '–' },
                { label: 'Durée', val: `${draft.durationMinutes / 60}h` },
                { label: 'Style', val: draft.style ?? '–' },
                { label: 'Zone', val: draft.bodyZone ?? '–' },
              ].map(r => (
                <View key={r.label} style={styles.recapRow}>
                  <Text style={styles.recapLabel}>{r.label}</Text>
                  <Text style={styles.recapVal}>{r.val}</Text>
                </View>
              ))}
              <View style={styles.recapDivider} />
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Total estimé</Text>
                <Text style={styles.recapTotal}>{total}€</Text>
              </View>
              <View style={[styles.recapRow, styles.depositRow]}>
                <Text style={styles.depositLabel}>Acompte maintenant (30%)</Text>
                <Text style={styles.depositVal}>{deposit}€</Text>
              </View>
            </View>
            <Text style={styles.depositNote}>L'acompte sera encaissé après confirmation de l'artiste. Solde réglé le jour de la séance.</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaBar}>
        {step < 3
          ? <Button label="Continuer →" onPress={() => setStep(step + 1)} />
          : <Button label={`Envoyer la demande · Acompte ${deposit}€`} onPress={handleConfirm} loading={loading} />
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12, backgroundColor: Colors.cream },
  back: { fontSize: 22, color: Colors.ink },
  headerTitle: { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.ink },
  stepper: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.coral, width: 20 },
  content: { padding: 20, paddingBottom: 100 },
  stepContent: { gap: 20 },
  stepTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Colors.ink },
  label: { fontFamily: 'Syne_600SemiBold', fontSize: 15, color: Colors.ink },
  labelVal: { color: Colors.coral },
  datesRow: { gap: 8 },
  dateCard: { width: 60, padding: 10, borderRadius: 12, alignItems: 'center', gap: 2, backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.border },
  dateCardActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  dateDow: { fontFamily: 'Syne_400Regular', fontSize: 11, color: Colors.muted, textTransform: 'capitalize' },
  dateDowActive: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Colors.ink },
  dateNumActive: { color: Colors.white },
  dateMon: { fontFamily: 'Syne_400Regular', fontSize: 11, color: Colors.muted, textTransform: 'capitalize' },
  dateMonActive: { color: 'rgba(255,255,255,0.8)' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.border },
  timeBtnActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  timeText: { fontFamily: 'Syne_500Medium', fontSize: 14, color: Colors.ink },
  timeTextActive: { color: Colors.white },
  durationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.border },
  durBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  durText: { fontFamily: 'Syne_500Medium', fontSize: 14, color: Colors.ink },
  durTextActive: { color: Colors.white },
  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stylePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.border },
  stylePillActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  stylePillText: { fontFamily: 'Syne_500Medium', fontSize: 13, color: Colors.ink },
  stylePillTextActive: { color: Colors.white },
  textarea: { minHeight: 100, backgroundColor: Colors.cream, borderRadius: 12, padding: 14, fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.ink, borderWidth: 1.5, borderColor: Colors.border, textAlignVertical: 'top' },
  recapCard: { backgroundColor: Colors.cream, borderRadius: 16, padding: 16, gap: 12, ...Shadows.sm },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recapLabel: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted },
  recapVal: { fontFamily: 'Syne_600SemiBold', fontSize: 14, color: Colors.ink },
  recapDivider: { height: 1, backgroundColor: Colors.border },
  recapTotal: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.ink },
  depositRow: { backgroundColor: Colors.coral + '12', padding: 10, borderRadius: 10, marginTop: -4 },
  depositLabel: { fontFamily: 'Syne_600SemiBold', fontSize: 14, color: Colors.coral },
  depositVal: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Colors.coral },
  depositNote: { fontFamily: 'Syne_400Regular', fontSize: 13, color: Colors.muted, lineHeight: 20 },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: Colors.beige, borderTopWidth: 1, borderTopColor: Colors.border },
})
