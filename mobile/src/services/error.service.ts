import { Alert } from 'react-native';

type ErrorLevel = 'info' | 'warning' | 'error' | 'fatal';

interface ErrorLog {
  level: ErrorLevel;
  message: string;
  error?: Error;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class ErrorService {
  private static instance: ErrorService;
  private logs: ErrorLog[] = [];

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  log(level: ErrorLevel, message: string, error?: Error, context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      level,
      message,
      error,
      timestamp: new Date().toISOString(),
      context
    };
    
    this.logs.push(errorLog);
    
    if (__DEV__) {
      console.log(`[${level.toUpperCase()}] ${message}`, error || '', context || '');
    }

    // En production, on pourrait envoyer les logs à un service comme Sentry
    if (level === 'error' || level === 'fatal') {
      // TODO: Intégrer Sentry ou un autre service de monitoring
      this.showErrorDialog(message);
    }
  }

  private showErrorDialog(message: string) {
    Alert.alert(
      'Erreur',
      'Une erreur est survenue. Nos équipes ont été notifiées.',
      [{ text: 'OK', onPress: () => {} }]
    );
  }

  // Pour le debugging
  getLogs(): ErrorLog[] {
    return this.logs;
  }

  // Pour nettoyer les logs
  clearLogs() {
    this.logs = [];
  }
}

export const errorService = ErrorService.getInstance();