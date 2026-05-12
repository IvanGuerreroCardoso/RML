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
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createListTable } from './src/services/listsDbService';
import AddItemScreen from './src/views/AddItemScreen';
import { createItemsTable } from './src/services/listItemsDbService';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import { Feather } from "@react-native-vector-icons/feather";
import { useLayoutEffect } from 'react';
import { ThemeProvider as RNEThemeProvider, useTheme } from '@rneui/themed';
import { RootStackParamList } from './src/models/models';
import { Appearance } from 'react-native';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';

/*const RootStack = createNativeStackNavigator({
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
*/
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  const { t } = useTranslation();
  /* const homeTitle = useMemo(() => t("yourLists"), [t]);
   const addListTitle = useMemo(() => t("addLists"), [t]);
   const addItemTitle = useMemo(() => t("addItem"), [t]);
   const settingsTitle = useMemo(() => t("settings"), [t]);
 */
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t("yourLists"),
          headerRight: () => {
            const nav = useNavigation();
            const { theme } = useTheme();
            return <Feather onPress={() => nav.navigate("Settings")} name="settings" size={20} color={theme.colors.primary} />
          }
        }}
      />
      <Stack.Screen
        name="AddList"
        component={AddListScreen}
        options={{
          title: t("addLists")
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

createListTable();
createItemsTable();

const Navigation = () => {
  const { theme } = useAppTheme();

  return (
    <NavigationContainer theme={theme as any}>
      <RNEThemeProvider theme={theme}>
        <RootStack />
      </RNEThemeProvider>
    </NavigationContainer>
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


/*type RootStackParamList = StaticParamList<typeof RootStack>;
*/
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
