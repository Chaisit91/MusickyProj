// React Error Boundary — ดักจับ JavaScript error ใน component tree ไม่ให้แอพพัง | แสดงหน้า fallback พร้อมปุ่ม retry
//
// หลักการทำงาน:
// 1. Class component ที่ implement getDerivedStateFromError: เมื่อ child โยน error → ตั้ง hasError=true
// 2. componentDidCatch: log error ไปยัง console (สามารถ extend ส่ง Sentry ได้)
// 3. render: ถ้า hasError → แสดง fallback UI (หรือ custom fallback จาก props)
// 4. ปุ่ม retry: reset state hasError=false ให้ React พยายาม render children ใหม่

import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>เกิดข้อผิดพลาด</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? "บางอย่างผิดพลาด กรุณาลองใหม่"}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.buttonText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#d4d4d4",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
  },
  buttonText: { color: "#000", fontWeight: "600", fontSize: 15 },
});
