import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

const TIMES = ["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00"]
const STYLES = ["Réaliste", "Old School", "Géométrique", "Blackwork", "Japonais", "Minimaliste"]
const ZONES = ["Avant-bras", "Bras entier", "Épaule", "Dos", "Torse", "Mollet", "Cheville"]

function getDates() {
  return Array.from({ length: 21 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d
  })
}

export default function BookingScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>()
  const { session } = useAuthStore()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(60)
  const [style, setStyle] = useState<string | null>(null)
  const [zone, setZone] = useState<string | null>(null)
  const [desc, setDesc] = useState("")
  const [loading, setLoading] = useState(false)

  const { data: artist } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      const { data } = await supabase.from("artists").select("*").eq("id", artistId).single()
      return data
    },
  })

  const total = Math.round((duration / 60) * (artist?.hourly_rate || 100))
  const deposit = Math.round(total * 0.30)
  const dates = getDates()

  const handleConfirm = async () => {
    if (!session) { router.push("/(onboarding)/auth"); return }
    if (!date || !time) { Alert.alert("Erreur", "Choisis une date et un créneau"); return }
    setLoading(true)
    const { data: booking, error } = await supabase.from("bookings").insert({
      client_id: session.user.id,
      artist_id: artistId,
      date, time_slot: time,
      duration_minutes: duration,
      style, body_zone: zone,
      description: desc,
      reference_images: [],
      total_amount: total,
      deposit_amount: deposit,
      status: "pending",
    }).select().single()
    setLoading(false)
    if (error) { Alert.alert("Erreur", error.message); return }
    Alert.alert("✅ Demande envoyée !", "L'artiste va confirmer.", [
      { text: "Voir la conversation", onPress: () => router.replace(`/chat/${booking.id}`) }
    ])
  }

  if (!artist) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réserver · {artist.stage_name}</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {[1,2,3].map(n => <View key={n} style={[styles.dot, step >= n && styles.dotActive]} />)}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Date & Heure</Text>
            <Text style={styles.label}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {dates.map(d => {
                const iso = d.toISOString().split("T")[0]
                return (
                  <TouchableOpacity key={iso} style={[styles.dateCard, date === iso && styles.dateCardActive]} onPress={() => setDate(iso)}>
                    <Text style={[styles.dateDow, date === iso && { color: "rgba(255,255,255,0.8)" }]}>{d.toLocaleDateString("fr-FR", { weekday: "short" })}</Text>
                    <Text style={[styles.dateNum, date === iso && { color: "#fff" }]}>{d.getDate()}</Text>
                    <Text style={[styles.dateMon, date === iso && { color: "rgba(255,255,255,0.8)" }]}>{d.toLocaleDateString("fr-FR", { month: "short" })}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
            <Text style={styles.label}>Créneau</Text>
            <View style={styles.grid}>
              {TIMES.map(t => (
                <TouchableOpacity key={t} style={[styles.timeBtn, time === t && styles.timeBtnActive]} onPress={() => setTime(t)}>
                  <Text style={[styles.timeTxt, time === t && { color: "#fff" }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Durée: {duration/60}h</Text>
            <View style={styles.grid}>
              {[60,90,120,180,240,360].map(d => (
                <TouchableOpacity key={d} style={[styles.timeBtn, duration === d && styles.timeBtnDark]} onPress={() => setDuration(d)}>
                  <Text style={[styles.timeTxt, duration === d && { color: "#fff" }]}>{d/60}h</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ton projet</Text>
            <Text style={styles.label}>Style</Text>
            <View style={styles.flexWrap}>
              {STYLES.map(s => (
                <TouchableOpacity key={s} style={[styles.pill, style === s && styles.pillActive]} onPress={() => setStyle(s)}>
                  <Text style={[styles.pillText, style === s && { color: "#fff" }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Zone du corps</Text>
            <View style={styles.flexWrap}>
              {ZONES.map(z => (
                <TouchableOpacity key={z} style={[styles.pill, zone === z && styles.pillActive]} onPress={() => setZone(z)}>
                  <Text style={[styles.pillText, zone === z && { color: "#fff" }]}>{z}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textarea}
              value={desc}
              onChangeText={setDesc}
              placeholder="Taille, idées, références..."
              placeholderTextColor="#8C8A84"
              multiline
              numberOfLines={4}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Récapitulatif</Text>
            <View style={styles.recap}>
              {[
                ["Artiste", artist.stage_name],
                ["Date", date ? new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" }) : "–"],
                ["Heure", time || "–"],
                ["Durée", `${duration/60}h`],
                ["Style", style || "–"],
                ["Zone", zone || "–"],
              ].map(([l, v]) => (
                <View key={l} style={styles.recapRow}>
                  <Text style={styles.recapLabel}>{l}</Text>
                  <Text style={styles.recapVal}>{v}</Text>
                </View>
              ))}
              <View style={[styles.recapRow, { borderTopWidth: 1, borderTopColor: "#E5E3DF", marginTop: 8, paddingTop: 12 }]}>
                <Text style={styles.recapLabel}>Total estimé</Text>
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F0E17" }}>{total}€</Text>
              </View>
              <View style={[styles.recapRow, { backgroundColor: "#E8573A15", padding: 10, borderRadius: 10 }]}>
                <Text style={{ fontWeight: "700", color: "#E8573A" }}>Acompte (30%)</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#E8573A" }}>{deposit}€</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: "#8C8A84", lineHeight: 20 }}>Acompte encaissé après confirmation. Solde réglé le jour de la séance.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.ctaBar}>
        {step < 3
          ? <TouchableOpacity style={styles.btn} onPress={() => setStep(step + 1)}>
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          : <TouchableOpacity style={[styles.btn, loading && { opacity: 0.5 }]} onPress={handleConfirm} disabled={loading}>
              <Text style={styles.btnText}>{loading ? "Envoi..." : `Envoyer · Acompte ${deposit}€`}</Text>
            </TouchableOpacity>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#E5E3DF", gap: 10, backgroundColor: "#FDFAF5" },
  back: { fontSize: 22, color: "#0F0E17" },
  headerTitle: { fontWeight: "700", fontSize: 16, color: "#0F0E17" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E5E3DF" },
  dotActive: { backgroundColor: "#E8573A", width: 20 },
  content: { padding: 20, paddingBottom: 100 },
  stepContent: { gap: 20 },
  stepTitle: { fontSize: 26, fontWeight: "800", color: "#0F0E17" },
  label: { fontWeight: "700", fontSize: 15, color: "#0F0E17" },
  dateCard: { width: 60, padding: 10, borderRadius: 12, alignItems: "center", gap: 2, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  dateCardActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  dateDow: { fontSize: 11, color: "#8C8A84", textTransform: "capitalize" },
  dateNum: { fontSize: 20, fontWeight: "800", color: "#0F0E17" },
  dateMon: { fontSize: 11, color: "#8C8A84", textTransform: "capitalize" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  timeBtnActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  timeBtnDark: { backgroundColor: "#0F0E17", borderColor: "#0F0E17" },
  timeTxt: { fontWeight: "600", fontSize: 14, color: "#0F0E17" },
  flexWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  pillActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#0F0E17" },
  textarea: { minHeight: 100, backgroundColor: "#FDFAF5", borderRadius: 12, padding: 14, fontSize: 15, color: "#0F0E17", borderWidth: 1.5, borderColor: "#E5E3DF", textAlignVertical: "top" },
  recap: { backgroundColor: "#FDFAF5", borderRadius: 16, padding: 16, gap: 12 },
  recapRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recapLabel: { fontSize: 14, color: "#8C8A84" },
  recapVal: { fontSize: 14, fontWeight: "700", color: "#0F0E17" },
  ctaBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: "#F5F3EF", borderTopWidth: 1, borderTopColor: "#E5E3DF" },
  btn: { height: 54, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})