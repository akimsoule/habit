import { StyleSheet, View, StatusBar } from 'react-native';
import { HabitAppProvider } from './src/providers/HabitAppProvider';
import { ThemeProvider } from './src/providers/ThemeProvider';
import { ToastProvider } from './src/providers/ToastProvider';
import { HomeScreen } from './src/components/HomeScreen';

export default function App() {
  return (
    <ThemeProvider>
      <HabitAppProvider>
        <ToastProvider>
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <HomeScreen />
          </View>
        </ToastProvider>
      </HabitAppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
