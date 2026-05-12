/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import AddListScreen from './src/views/AddListScreen';
import HomeScreen from './src/views/HomeScreen';
import ListScreen from './src/views/ListScreen';
import SettingsScreen from "./src/views/SettingsScreen"
import { createStaticNavigation, DarkTheme, DefaultTheme, StaticParamList, useNavigation, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createListTable } from './src/services/listsDbService';
import AddItemScreen from './src/views/AddItemScreen';
import { createItemsTable } from './src/services/listItemsDbService';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { t } from 'i18next';
import { Feather } from "@react-native-vector-icons/feather";
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@rneui/themed';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: t("yourLists"),
        headerRight: () => {
          const nav = useNavigation();
          const { colors } = useTheme();
          return <Feather onPress={() => nav.navigate("Settings")} name="settings" size={20} color={colors.primary} />
        }
      }
    },
    AddList: {
      screen: AddListScreen,
      options: { title: t("addList") }
    },
    List: {
      screen: ListScreen,
      options: { title: "List Items" }
    },
    AddItem: {
      screen: AddItemScreen,
      options: { title: t("addItem") }
    },
    Settings: {
      screen: SettingsScreen,
      options: { title: t("settings") }
    }
  },
});

createListTable();
createItemsTable();

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  const scheme = useColorScheme()

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <Navigation theme={scheme === 'dark' ? DarkTheme : DefaultTheme} />
      </ThemeProvider>
    </I18nextProvider>);
}

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
