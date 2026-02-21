/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import AddListScreen from './src/views/AddListScreen';
import HomeScreen from './src/views/HomeScreen';
import ListScreen from './src/views/ListScreen';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createListTable } from './src/services/listsDbService';
import AddItemScreen from './src/views/AddItemScreen';
import { createItemsTable } from './src/services/listItemsDbService';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { t } from 'i18next';


const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {title: t("yourLists")}
    },
    AddList: {
      screen: AddListScreen,
      options: {title: t("addList")}
    },
    List: {
      screen: ListScreen,
      options: {title: "List Items"}
    },
    AddItem: {
      screen: AddItemScreen,
      options: {title: t("addItem")}
    }
  },
});

createListTable();
createItemsTable();

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return (
  <I18nextProvider i18n={i18n}>
    <Navigation />
  </I18nextProvider>);
}

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}