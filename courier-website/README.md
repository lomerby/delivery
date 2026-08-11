# SwiftLink Courier

This courier website has three interfaces:

- Customer: book and track shipments.
- Courier: register with a photo, driver's license number, and plate number, then stay on standby until approval.
- Admin: log in with the seeded admin account to approve/reject couriers and assign shipments.

Data is stored in MongoDB through the local Node.js server. Add a MongoDB connection string in `.env` before starting the app.

## Start the website

1. Copy `.env.example` to `.env`.
2. Put your MongoDB URI in `MONGODB_URI`.
3. Set an `ADMIN_PASSWORD`.
4. Run:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

Admin accounts are not available through public sign-up. Log in as `admin@swiftlink.local` using the password you set in `.env`. The demo default is `wwe2k191`.

## Deploy on Render

This project includes a `render.yaml` blueprint for Render.

1. Push this folder to a GitHub, GitLab, or Bitbucket repository.
2. In Render, choose **New > Blueprint** and connect the repository.
3. When Render asks for secret environment variables, enter:

```text
MONGODB_URI=your MongoDB connection string
ADMIN_PASSWORD=your secure admin password
```

Render will use:

```text
Build Command: npm install
Start Command: npm start
```

After deployment, log in as `admin@swiftlink.local` with the `ADMIN_PASSWORD` value you set in Render.
