# HomeKeeper v2

A shared household stock and shopping-list app for iPhone, Mac and the web.

## Included

- One shared email/password login
- Firestore cloud sync between devices
- Starter toiletries imported from the original spreadsheet
- Custom categories
- Individual minimum stock level for every item
- Automatic shared shopping list
- Manual shopping-list pinning
- Search and low-stock filtering
- Offline cache and installable PWA
- JSON backups

## 1. Replace your existing project files

Copy everything from this folder into your local `HomeKeeper` repository. Replace the old `index.html`.

## 2. Create the shared Firebase user

In Firebase:

1. Open **Authentication**
2. Open **Users**
3. Click **Add user**
4. Enter the shared email address and a strong password
5. Save
6. Copy the new user's **UID**

Do not add a sign-up screen to the public app. Both household members sign in using this same account.

## 3. Publish the Firestore security rules

1. Open `firestore.rules`
2. Replace `YOUR_SHARED_ACCOUNT_UID` with the UID copied above
3. In Firebase, open **Firestore Database → Rules**
4. Replace the existing rules with the contents of `firestore.rules`
5. Click **Publish**

Until this is done, the app will not be allowed to read or write stock data.

## 4. Add the GitHub Pages domain to Firebase Authentication

In **Firebase → Authentication → Settings → Authorized domains**, add:

`infiniteclicks.github.io`

Do not include `https://` or `/HomeKeeper`.

## 5. Commit and publish

In GitHub Desktop:

1. Review the changed files
2. Summary: `Build HomeKeeper v2`
3. Click **Commit to main**
4. Click **Push origin**

GitHub Pages will redeploy automatically. Your address should be similar to:

`https://infiniteclicks.github.io/HomeKeeper/`

Repository URLs are case-sensitive in some contexts. Use the exact repository name shown by GitHub.

## 6. First use

1. Open the live app
2. Sign in using the shared Firebase account
3. The starter toiletries and categories will be created automatically
4. Open the same address on the second iPhone and use the same login
5. Add it to the iPhone Home Screen from Safari

## Important security note

The Firebase browser configuration is designed to be included in web applications. Database access is protected by Authentication and the UID-restricted Firestore rules. Never upload a Firebase service-account key or private key to GitHub.
