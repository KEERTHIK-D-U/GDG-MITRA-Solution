# Mitra

This is the repository for the Mitra community platform. Your digital ecosystem for turning skills into real-world impact.

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
      
      // Only the original host can update or delete their own document.
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.hostId;
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

## 🚀 Pushing to GitHub

To share your project and track its history, you can push it to a GitHub repository. Follow these steps from your terminal:

**1. Create a New Repository on GitHub**

*   Go to [github.com](https://github.com) and log in.
*   Click the **+** icon in the top right and select **"New repository"**.
*   Give your repository a name (e.g., `mitra-community-app`).
*   **Important:** Do **not** initialize the repository with a `README`, `.gitignore`, or license file. Your project already has these.
*   Click **"Create repository"**.

**2. Initialize Your Local Project as a Git Repository**

Open a terminal or command prompt, navigate into your project's root directory, and run the following command. This will initialize Git and set the default branch name to `main`.

```bash
git init -b main
```

**3. Add and Commit Your Files**

Stage all your project files for the first commit.

```bash
git add .
```

Now, save the files into the repository's history.

```bash
git commit -m "Initial commit"
```

**4. Connect to Your GitHub Repository**

On the GitHub page for your new repository, find the remote URL (it looks like `https://github.com/your-username/your-repo-name.git`). Copy it, and then run the following command, replacing the placeholder URL with your own.

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**5. Push Your Code**

Finally, upload your project to GitHub.

```bash
git push -u origin main
```

Your project is now on GitHub! You can continue to make changes and use `git add`, `git commit`, and `git push` to update your repository.
