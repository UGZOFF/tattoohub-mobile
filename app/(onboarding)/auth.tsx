import { useState, useRef } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/auth.store'
import { useUIStore } from '../../stores/ui.store'
import { Colors } from '../../constants/colors'
import { Button } from '../../components/ui/Button'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<TextInput[]>([])
  const { sendOtp, verifyOtp, profile } = useAuthStore()
  const { showToast } = useUIStore()

  const handleSendOtp = async () => {
    if (!email.includes('@')) { showToast('Email invalide', 'error'); return }
    setLoading(true)
    const { error } = await sendOtp(email)
    setLoading(false)
    if (error) { showToast(error, 'error'); return }
    setStep('otp')
    showToast('Code envoyé ! Vérifie ta boîte mail.', 'success')
  }

  const handleOtpChange = (val: string, index: number) => {
    const digits = val.replace(/\D/g, '').slice(0, 1)
    const newOtp = [...otp]
    newOtp[index] = digits
    setOtp(newOtp)
    if (digits && index < 5) inputRefs.current[index + 1]?.focus()
    if (!digits && index > 0) inputRefs.current[index - 1]?.focus()
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleVerify = async (code: string) => {
    setLoading(true)
    const { error } = await verifyOtp(email, code)
    setLoading(false)
    if (error) { showToast('Code incorrect. Réessaie.', 'error'); setOtp(['','','','','','']); inputRefs.current[0]?.focus(); return }
    router.replace(profile?.onboarding_complete ? '/(tabs)/home' : '/(onboarding)/complete-profile')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{step === 'email' ? 'Ton email' : 'Code reçu'}</Text>
        <Text style={styles.subtitle}>
          {step === 'email'
            ? 'On t\'envoie un code à 6 chiffres. Pas de mot de passe.'
            : `Code envoyé à ${email}. Vérifie tes spams si besoin.`}
        </Text>

        {step === 'email' ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
              accessibilityLabel="Adresse email"
            />
            <Button label="Recevoir le code" onPress={handleSendOtp} loading={loading} />
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
                  accessibilityLabel={`Chiffre ${i + 1} du code`}
                />
              ))}
            </View>
            {loading && <Text style={styles.verifying}>Vérification...</Text>}
            <TouchableOpacity onPress={() => { setStep('email'); setOtp(['','','','','','']) }}>
              <Text style={styles.resend}>Renvoyer le code</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  content: { padding: 28, paddingTop: 60, gap: 24 },
  back: { alignSelf: 'flex-start' },
  backText: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.coral },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, color: Colors.ink },
  subtitle: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.muted, lineHeight: 24 },
  form: { gap: 16, marginTop: 8 },
  input: { height: 54, backgroundColor: Colors.cream, borderRadius: 12, paddingHorizontal: 18, fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.ink, borderWidth: 1.5, borderColor: Colors.border },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  otpInput: { flex: 1, height: 58, backgroundColor: Colors.cream, borderRadius: 12, textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.ink, borderWidth: 1.5, borderColor: Colors.border },
  otpFilled: { borderColor: Colors.coral, backgroundColor: Colors.white },
  verifying: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted, textAlign: 'center' },
  resend: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.coral, textAlign: 'center', marginTop: 4 },
})
