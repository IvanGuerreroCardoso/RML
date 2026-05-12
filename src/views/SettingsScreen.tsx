import { View, useColorScheme, Appearance } from "react-native";
import { useEffect, useState } from "react"
import { Switch, useThemeMode } from "@rneui/themed";
import { Text } from "@rneui/base";
import { t } from "i18next";

export default function SettingsScreen() {
  const { mode, setMode } = useThemeMode();
  const [darkMode, setDarkMode] = useState(mode === "dark");

  useEffect(() => {
    let modeToSet: "dark" | "light" = darkMode ? "dark" : "light";
    setMode(modeToSet);
  }, [darkMode])

  return (
    <View>
      <View>
        <Text>{t("enableDarkMode")}</Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => setDarkMode(value)}
        />
      </View>
    </View>
  );
}
