import { View, Text, StyleSheet } from "react-native"
import { useUIStore } from "../../stores/ui.store"

export function ToastContainer() {
  const { toasts } = useUIStore()
  if (toasts.length === 0) return null
  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(toast => (
        <View key={toast.id} style={[styles.toast, toast.type === "error" && styles.error, toast.type === "success" && styles.success]}>
          <Text style={styles.text}>{toast.message}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 100, left: 20, right: 20, zIndex: 9999, gap: 8 },
  toast: { padding: 14, borderRadius: 12, backgroundColor: "#0F0E17" },
  error: { backgroundColor: "#C62828" },
  success: { backgroundColor: "#2E7D32" },
  text: { color: "#fff", fontSize: 14, textAlign: "center", fontWeight: "600" },
})