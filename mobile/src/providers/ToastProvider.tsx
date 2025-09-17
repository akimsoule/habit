import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ToastContext, ToastOptions } from './ToastContext';
import { useTheme } from './useTheme';

type ToastState = { id: number; title: string; opts?: ToastOptions } | null;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastState>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const nextId = useRef(1);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback((title: string, opts?: ToastOptions) => {
    const id = nextId.current++;
    setToast({ id, title, opts });
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
    const duration = opts?.durationMs ?? 2000;
    setTimeout(() => {
      if (toast && toast.id !== id) return;
      hide();
    }, duration);
  }, [hide, opacity, translateY, toast]);

  const value = useMemo(() => ({ show }), [show]);
  const bg = toast?.opts?.type === 'success' ? '#16a34a' : toast?.opts?.type === 'error' ? '#dc2626' : colors.card;
  const fg = toast?.opts?.type ? '#fff' : colors.text;

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {toast && (
          <Animated.View
            pointerEvents="none"
            style={[styles.container, { opacity, transform: [{ translateY }] }]}
          >
            <View style={[styles.toast, { backgroundColor: bg, shadowColor: '#000' }]}>
              <Text style={[styles.title, { color: fg }]}>{toast.title}</Text>
              {toast.opts?.description ? (
                <Text style={[styles.desc, { color: fg }]}>{toast.opts.description}</Text>
              ) : null}
            </View>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center' },
  toast: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, maxWidth: '90%', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  title: { fontWeight: '700' },
  desc: { marginTop: 4 },
});
