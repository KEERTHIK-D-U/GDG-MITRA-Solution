# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables Setup

This project uses Firebase for authentication and database services. You need to provide your own Firebase project credentials to run the app.

1.  **Create an environment file**: In the root of the project, rename the `.env.local.example` file to `.env.local`.

2.  **Find your Firebase credentials**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Select your project.
    - Click the gear icon ⚙️ next to "Project Overview" and go to **Project settings**.
    - In the "General" tab, scroll down to the "Your apps" section.
    - Select your web app and find the **SDK setup and configuration** section.

3.  **Add your credentials**: Open the new `.env.local` file and replace the placeholder values (e.g., `YOUR_API_KEY_HERE`) with your actual Firebase project configuration values.

4.  **Restart your server**: After updating the `.env.local` file, you **must** restart your development server for the changes to take effect.
