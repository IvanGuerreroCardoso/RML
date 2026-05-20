export { };

declare module 'react-native' {
  interface NativeModulesStatic {
    /**
     * Native module that returns the device locale as a BCP‑47 language tag,
     * e.g. "en-US", "fr-CA".
     *
     * @returns Promise that resolves to the locale string.
     */
    LocaleModule: {
      getLocale(): Promise<string>;
    };
  }
}

