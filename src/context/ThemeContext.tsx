import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Theme as NavTheme } from '@react-navigation/native';
import { Colors, FullTheme as ElementsTheme } from '@rneui/themed';
import { getSettings, updateTheme } from '../services/settingsDbService';

type Mode = 'light' | 'dark';

interface ThemeContextProps {
  mode: Mode;
  toggleMode: () => void;
  theme: Partial<ElementsTheme>;
}

const LightPalette = {
  primary: '#6200ee',
  background: '#ffffff',
  card: '#f8f9fa',
  text: '#000000',
  mutedText: "#777",
  border: '#c7c7c7',
  notification: '#ff80ab',
} as const;

const DarkPalette = {
  primary: '#bb86fc',
  background: '#121212',
  card: '#1f1f1f',
  text: '#ffffff',
  mutedText: "#555",
  border: '#272727',
  notification: '#ff80ab',
} as const;

const DefaultFonts: Record<string, any> = {
  regular: { fontFamily: "", fontWeight: 'normal' },
  medium: { fontFamily: "", fontWeight: '500' },
  bold: { fontFamily: "", fontWeight: '900' },
  heavy: { fontFamily: "", fontWeight: '700' },
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('light');

  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    const loadTheme = async () => {
      const settings = await getSettings();

      if (settings?.theme) {
        setMode(settings.theme);
        return;
      }
      updateTheme("light");
    }

    loadTheme();
  }, [])

  const theme: Partial<ElementsTheme> = useMemo(() => {
    const palette = mode === 'light' ? LightPalette : DarkPalette;

    const navigationTheme: NavTheme = {
      dark: mode === 'dark',
      colors: {
        primary: palette.primary,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        notification: palette.notification
      },
      fonts: {
        regular: { fontFamily: "", fontWeight: 'normal' },
        medium: { fontFamily: "", fontWeight: '500' },
        bold: { fontFamily: "", fontWeight: '900' },
        heavy: { fontFamily: "", fontWeight: '700' },
      },
    };

    return {
      ...navigationTheme,
      colors: navigationTheme.colors as Colors,
      fonts: DefaultFonts,
      components: {
        Text: {
          style: {
            color: palette.text
          }
        },
        Button: {
          disabledStyle: {
            backgroundColor: palette.border,
            color: palette.mutedText
          }
        },
        Input: {
          style: {
            color: palette.text
          }
        }
      },
      mode: mode,
      spacing: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
      }
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
};
