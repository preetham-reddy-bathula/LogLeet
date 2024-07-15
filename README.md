# LogLeet

LogLeet is a cross-platform mobile application (iOS and Android) built with React Native and Expo. It helps you keep track of your problem-solving journey on LeetCode, including details such as difficulty level, time taken to solve problems, first attempt date, notes, revisit dates, last revisit date, revisit frequency, time complexity, space complexity, company tags, and more.

## Features

- Track and manage your LeetCode problems.
- Record details such as problem name, link, difficulty, time taken, first attempt date, notes, revisit dates, and more.
- Set automatic revisit reminders based on revisit frequency.
- View a list of all recorded problems and their revisit dates.
- Edit and delete problem records.
- Receive notifications for revisit reminders.

## Screenshots

![Splash Screen](path_to_splash_screen_screenshot)
![Main Screen](path_to_main_screen_screenshot)
![Add/Edit Problem Screen](path_to_add_edit_screen_screenshot)

## Tech Stack

- React Native
- Expo
- Firebase Realtime Database
- Expo Notifications
- React Hook Form
- React Native Paper
- React Native Modal Selector
- React Native DateTimePicker

## Getting Started

### Prerequisites

- Node.js installed (v14.x or later recommended)
- npm or yarn package manager
- Expo CLI installed globally (`npm install -g expo-cli`)
- EAS CLI installed globally (`npm install -g eas-cli`)
- Firebase project set up

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/LogLeet.git
    cd LogLeet
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up Firebase**:
    - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    - Create a Realtime Database and set the rules to allow read and write access.
    - Obtain your Firebase configuration and add it to a `.env` file in the root of your project:

    ```env
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    FIREBASE_DATABASE_URL=your_firebase_database_url
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    FIREBASE_APP_ID=your_firebase_app_id
    EXPO_PROJECT_ID=your_expo_project_id
    ```

4. **Configure EAS**:
    - Run the following command to configure EAS for your project:

    ```bash
    eas build:configure
    ```

### Running the Project

1. **Start the Expo development server**:

    ```bash
    npx expo start
    ```

2. **Open the project**:
    - Use Expo Go app on your Android or iOS device to scan the QR code displayed in the terminal or browser.

### Building Standalone Apps

#### For Android

1. **Build the APK**:

    ```bash
    eas build -p android
    ```

2. **Download and install the APK**:
    - Once the build completes, download the APK file from the URL provided.
    - Transfer the APK to your Android device and install it.

#### For iOS

1. **Build the IPA**:

    ```bash
    eas build -p ios
    ```

2. **Distribute the IPA**:
    - Follow the instructions to upload the IPA to TestFlight or use a service like Diawi to distribute and install the app on your iOS device.


### Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

### License

This project is licensed under the MIT License.

### Contact

Your Name - [preetham.bathul@gmail.com](mailto:preetham.bathul@gmail.com)
LinkedIn - [https://www.linkedin.com/in/preetham-kumar-reddy-b-b6821116b/] (https://www.linkedin.com/in/preetham-kumar-reddy-b-b6821116b/)
Project Link: [https://github.com/preetham-reddy-bathula/LogLeet/](https://github.com/preetham-reddy-bathula/LogLeet/)


