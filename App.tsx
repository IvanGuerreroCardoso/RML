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
import SQLite from 'react-native-sqlite-storage';


const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {title: "Home"}
    },
    AddList: {
      screen: AddListScreen,
      options: {title: "Add List"}
    },
    List: {
      screen: ListScreen,
      options: {title: "List Items"}
    },
    AddItem: {
      screen: AddItemScreen,
      options: {title: "Add List Item"}
    }
  },
});

createListTable();
createItemsTable();

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}