# Rated Media Lists

Rated Media Lists is a local-first mobile app for creating lists of media and rating the items in them. It is built with React Native and stores data on the device with SQLite. There is no backend account or server connection required.

## Features

- Create, edit, browse, and delete lists.
- Add media items with a name, author, genre, release year, rating, and rated status.
- Edit or delete items with swipe actions.
- Search a list by item name, author, or genre.
- Filter items by rated status and release-year range.
- Sort by name, author, genre, rating, year, or rating date in ascending or descending order.
- Choose a random item, preferring items that have not been rated yet.
- Switch between light and dark themes.
- Use English or Spanish UI translations.
- Export all lists and items as a CSV backup through the device's system save dialog.
- Import a CSV backup from the device.

## Requirements

Install the standard React Native development tools for your target platform before continuing:

- Node.js 20 or newer
- npm
- Android Studio and an Android SDK for Android development
- A JDK supported by the installed React Native/Android Gradle setup
- Xcode and CocoaPods for iOS development on macOS

For a physical Android device, enable Developer options and USB debugging. An Android emulator can be used instead.

## Getting Started

Clone the repository and install JavaScript dependencies:

```bash
git clone <repository-url>
cd RatedMediaListsN
npm install
```

Start Metro in a terminal:

```bash
npm start
```

Keep Metro running while launching the application from another terminal.

### Android

Start an emulator or connect an Android device, then run:

```bash
npm run android
```

For a release build:

```bash
npm run android -- --mode=release
```

When using a physical device with a debug build, forward Metro's port if needed:

```bash
adb reverse tcp:8081 tcp:8081
```

### iOS

iOS builds require macOS with Xcode. Install CocoaPods dependencies first:

```bash
cd ios
pod install
cd ..
npm run ios
```

## Development Commands

```bash
npm start                 # Start Metro
npm run android           # Build and run Android
npm run ios               # Build and run iOS
npm run lint              # Run ESLint
npm test                  # Run Jest tests
```

## Data and Backups

Application data is stored locally in the SQLite database `ratedMediaLists.db`. The database is initialized on first launch and is not synchronized to a cloud service.

The **Export backup** action creates a CSV file and opens the platform document save dialog. Choose a location such as `Downloads` or `Documents`. The **Import backup** action lets you select a previously exported CSV file and recreates its lists, items, authors, and genres.

Imported files are expected to contain the CSV columns produced by the export feature, including:

```text
listId,listName,itemId,itemName,year,checked,rate,authorId,authorName,genreId,genreName,rateDate,createdAt
```

Importing adds the data to the current local database; it does not replace or clear existing lists.

## Project Structure

```text
App.tsx                    Application navigation and providers
src/components/            Reusable list, item, and tutorial components
src/context/               Theme context
src/models/                TypeScript domain models
src/services/              SQLite, import/export, and settings services
src/views/                 Application screens
locales/                   English and Spanish translations
android/                   Android native project
ios/                       iOS native project
__tests__/                 Jest tests
```

## Contributing

1. Create a feature branch.
2. Install dependencies with `npm install`.
3. Run `npm run lint` and `npm test` before opening a pull request.
4. Keep changes focused and update the README when setup or user-facing behavior changes.

## License

This project is open source. See [LICENSE](LICENSE) for the license terms and [NOTICE](NOTICE) for additional notices.