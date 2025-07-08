# Mitra

This is the repository for the Mitra community platform. Your digital ecosystem for turning skills into real-world impact.

## ❗️ Important: Environment Variables Setup

This project uses both Firebase and Google AI (for Genkit) services. You **must** provide your own API keys for the app to function correctly. Your `.env.local` file contains secret keys and must **NEVER** be committed to GitHub. The `.gitignore` file included in this project is already configured to prevent this from happening.

1.  **Create an environment file**: In the root of the project, create a new file named `.env.local` by copying the example file `env.local.example`.

2.  **Add your credentials**: Open your new `.env.local` file and add your secret keys.

    ### Firebase Keys
    Find your Firebase credentials in your [Firebase Console](https://console.firebase.google.com/) under **Project settings** > **General** > **Your apps** > **SDK setup and configuration**.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_HERE"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET_HERE"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID_HERE"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID_HERE"
    ```

    ### Genkit / Gemini AI Key
    The AI Mentor feature uses Genkit. You'll need a Google AI API key.
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key.
    - Add the key to your `.env.local` file:
    ```
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

3.  **Restart your server**: After updating the `.env.local` file, you **must** restart your development server for the new environment variables to be loaded.

## 🔥 Required: Firestore Security Rules

For the app to function correctly, you need to set up Firestore Security Rules. These rules protect your data from unauthorized access.

1.  Go to the **Firestore Database** section of your Firebase project.
2.  Click on the **Rules** tab.
3.  Replace the default rules with the following ruleset. This will allow the app's features to work as intended.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can create their own profile, and can only read/update their own data.
    // Admins can read/write/delete any user profile.
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Generic rule for events, projects, and hackathons
    match /{collectionName}/{itemId} where collectionName in ['events', 'projects', 'hackathons'] {
      // Any authenticated user can read.
      allow read: if request.auth != null;

      // Only 'host' role can create.
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'host';
      
      // The original host or an admin can update or delete a document.
      allow update, delete: if request.auth != null && (request.auth.uid == resource.data.hostId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Registrations for Events
    match /registrations/{registrationId} {
      // Users can only create registrations for themselves.
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Users can read their own registration.
      // The event host can read all registrations for their event.
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == get(/databases/$(database)/documents/events/$(resource.data.eventId)).data.hostId);
    }
    
    // Registrations for Hackathons
    match /hackathonRegistrations/{registrationId} {
      // Users can only create registrations for themselves.
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Users can read their own registration.
      // The hackathon host can read all registrations for their event.
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == get(/databases/$(database)/documents/hackathons/$(resource.data.hackathonId)).data.hostId);
    }
    
    // Contributions for Projects
    match /projectContributions/{contributionId} {
      // Users can only create contributions for themselves.
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;

      // Users can read their own contribution record.
      // The project host can read all contribution records for their project.
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.hostId);
    }
  }
}
```

## 🚀 Version Control with Git & GitHub

### Initial Push to a New Repository

If you haven't pushed this project to GitHub yet, follow these steps to set it up.

1.  **Create a new repository on GitHub**: Go to [GitHub](https://github.com/new) and create a new, empty repository. Do **not** initialize it with a README, .gitignore, or license file.

2.  **Run the following commands in your terminal**:

    ```bash
    # Initialize a new Git repository and switch to the 'main' branch
    git init -b main

    # Add all files to the staging area
    git add .

    # Commit your changes
    git commit -m "Initial commit"

    # Add your new GitHub repository as the remote origin
    # Replace YOUR_USERNAME and YOUR_REPOSITORY with your actual GitHub details
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

    # Push your code to GitHub
    git push -u origin main
    ```

### Pushing Updates to an Existing Repository

Once your repository is set up on GitHub, follow these simple steps to save your changes.

1.  **Stage your changes**: This prepares all modified files for your next save point (commit).

    ```bash
    git add .
    ```

2.  **Commit your changes**: This saves a snapshot of your staged files. Replace `"Your commit message"` with a brief description of the changes you made (e.g., `"Updated landing page headline"`).

    ```bash
    git commit -m "Your commit message"
    ```

3.  **Push your changes to GitHub**: This uploads your new commit to the repository.

    ```bash
    git push
    ```
