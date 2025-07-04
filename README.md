# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables Setup

This project uses Firebase for authentication and database services. You need to provide your own Firebase project credentials to run the app.

1.  **Create an environment file**: In the root of the project, rename the `.env.local.example` file to `.env.local`.

2.  **Add your credentials**: Open the new `.env.local` file and replace the placeholder values with your actual Firebase project configuration. You can find these in your Firebase project settings under "SDK setup and configuration".

3.  **Restart your server**: After updating the `.env.local` file, you **must** restart your development server for the changes to take effect.
