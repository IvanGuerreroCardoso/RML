import { View } from "react-native";
import { useEffect, useState } from "react"
import { Switch, useThemeMode } from "@rneui/themed";
import { Text } from "@rneui/base";
import { t } from "i18next";
import { useAppTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const { mode, toggleMode } = useAppTheme();
  const [darkMode, setDarkMode] = useState(mode === "dark");

  function changeMode(val: boolean) {
    setDarkMode(!darkMode)
    toggleMode();
  }

  return (
    <View>
      <View>
        <Text>{t("enableDarkMode")}</Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => changeMode(value)}
        />
      </View>
    </View>
  );
}
