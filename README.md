# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## ❗️ Important: Environment Variables Setup

This project uses Firebase for authentication, database, and file storage services. You **must** provide your own Firebase project credentials for the app to function correctly.

1.  **Create an environment file**: In the root of the project, rename the `.env.local.example` file to `.env.local`.

2.  **Find your Firebase credentials**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Select your project.
    - Click the gear icon ⚙️ next to "Project Overview" and go to **Project settings**.
    - In the "General" tab, scroll down to the "Your apps" section.
    - If you don't have a web app, create one.
    - Select your web app and find the **SDK setup and configuration** section. Choose the "Config" option.

3.  **Add your credentials**: Open your new `.env.local` file and replace the placeholder values (e.g., `YOUR_API_KEY_HERE`) with your actual Firebase project configuration values. You need to provide all of the following:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_HERE"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET_HERE"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID_HERE"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID_HERE"
    ```

4.  **Restart your server**: After updating the `.env.local` file, you **must** restart your development server for the changes to take effect.
