import { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { HabitAppProvider } from './src/providers/HabitAppProvider';
import { ThemeProvider } from './src/providers/ThemeProvider';
import { ToastProvider } from './src/providers/ToastProvider';
import { HomeScreen } from './src/components/HomeScreen';
import { SplashView } from './src/components/SplashScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Assurer que l'écran splash ne se cache pas automatiquement
    SplashScreen.preventAutoHideAsync().catch(() => {});
    async function prepare() {
      try {
        // Préchargements éventuels (fonts, data, etc.)
        await new Promise(resolve => setTimeout(resolve, 800));
        if (!cancelled) {
          setIsReady(true);
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }
    prepare();
    return () => { cancelled = true; };
  }, []);

  return (
    <ThemeProvider>
      {!isReady ? (
        <SplashView />
      ) : (
        <HabitAppProvider>
          <ToastProvider>
            <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#fff" />
              <HomeScreen />
            </View>
          </ToastProvider>
        </HabitAppProvider>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
