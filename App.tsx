import AddListScreen from './src/views/AddListScreen';
import HomeScreen from './src/views/HomeScreen';
import ListScreen from './src/views/ListScreen';
import SettingsScreen from "./src/views/SettingsScreen"
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddItemScreen from './src/views/AddItemScreen';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import { Feather } from "@react-native-vector-icons/feather";
import { ThemeProvider as RNEThemeProvider, useTheme } from '@rneui/themed';
import { RootStackParamList } from './src/models/models';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { initDb } from './src/services/settingsDbService';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const { theme } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t("yourLists"),
          headerRight: () => {
            return (
              <Pressable
                accessibilityLabel={t("settings")}
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => nav.navigate("Settings")}
                style={{ padding: 8 }}
              >
                <Feather name="settings" size={20} color={theme.colors.primary} />
              </Pressable>
            )
          }
        }}
      />
      <Stack.Screen
        name="AddList"
        component={AddListScreen}
        options={{
          title: t("addList")
        }}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          title: t("addItem")
        }}
      />
      <Stack.Screen
        name="List"
        component={ListScreen}
        options={({ route }) => ({
          title: route.params.name
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t("settings")
        }}
      />
    </Stack.Navigator>
  )
}

initDb();

const Navigation = () => {
  const { theme } = useAppTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme as any}>
        <RNEThemeProvider theme={theme}>
          <RootStack />
        </RNEThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Navigation />
      </I18nextProvider>
    </ThemeProvider>
  );
}


declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
