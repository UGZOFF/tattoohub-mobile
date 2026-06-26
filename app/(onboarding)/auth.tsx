import { useState, useRef } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native"
import { router } from "expo-router"
import { useAuthStore } from "../../stores/auth.store"

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<any[]>([])
  const { sendOtp, verifyOtp, profile } = useAuthStore()

  const handleSendOtp = async () => {
    if (!email.includes("@")) { Alert.alert("Email invalide"); return }
    setLoading(true)
    const { error } = await sendOtp(email)
    setLoading(false)
    if (error) { Alert.alert("Erreur", error); return }
    setStep("otp")
    Alert.alert("Code envoyé !", "Vérifie ta boîte mail.")
  }

  const handleOtpChange = (val: string, index: number) => {
    const digit = val.replace(/\D/g, "").slice(0, 1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
    if (!digit && index > 0) inputRefs.current[index - 1]?.focus()
    if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleVerify = async (code: string) => {
    setLoading(true)
    const { error } = await verifyOtp(email, code)
    setLoading(false)
    if (error) {
      Alert.alert("Erreur", "Code incorrect. Réessaie.")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      return
    }
    router.replace(profile?.onboarding_complete ? "/(tabs)/home" : "/(onboarding)/complete-profile")
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{step === "email" ? "Ton email" : "Code reçu"}</Text>
        <Text style={styles.subtitle}>
          {step === "email" ? "On t'envoie un code. Pas de mot de passe." : `Code envoyé à ${email}`}
        </Text>

        {step === "email" ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              placeholderTextColor="#8C8A84"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Envoi..." : "Recevoir le code"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => { if (ref) inputRefs.current[i] = ref }}
                  style={[styles.otpInput, digit ? styles.otpFilled : null]}
                  value={digit}
                  onChangeText={v => handleOtpChange(v, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
            {loading && <Text style={styles.verifying}>Vérification...</Text>}
            <TouchableOpacity onPress={() => { setStep("email"); setOtp(["","","","","",""]) }}>
              <Text style={styles.resend}>Renvoyer le code</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  content: { padding: 28, paddingTop: 60, gap: 24 },
  back: { alignSelf: "flex-start" },
  backText: { fontSize: 16, color: "#E8573A" },
  title: { fontSize: 36, fontWeight: "800", color: "#0F0E17" },
  subtitle: { fontSize: 16, color: "#8C8A84", lineHeight: 24 },
  form: { gap: 16, marginTop: 8 },
  input: { height: 54, backgroundColor: "#FDFAF5", borderRadius: 12, paddingHorizontal: 18, fontSize: 16, color: "#0F0E17", borderWidth: 1.5, borderColor: "#E5E3DF" },
  btn: { height: 54, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  otpRow: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  otpInput: { flex: 1, height: 58, backgroundColor: "#FDFAF5", borderRadius: 12, textAlign: "center", fontSize: 22, fontWeight: "800", color: "#0F0E17", borderWidth: 1.5, borderColor: "#E5E3DF" },
  otpFilled: { borderColor: "#E8573A", backgroundColor: "#fff" },
  verifying: { fontSize: 14, color: "#8C8A84", textAlign: "center" },
  resend: { fontSize: 14, color: "#E8573A", textAlign: "center", marginTop: 4 },
})