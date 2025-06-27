# PuzzleChat Setup Instructions

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- MongoDB Atlas account
- Cloudinary account

## 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose FREE shared cluster
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set a username and strong password
   - Grant "Read and write to any database" permission
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add your specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 2. Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for a free account

2. **Get API Credentials**
   - Go to your Dashboard
   - Find your credentials:
     - Cloud Name
     - API Key
     - API Secret
   - Keep these safe!

3. **Configure Upload Preset (Optional)**
   - Go to Settings > Upload
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Configure any transformations if needed
   - Save the preset name

## 3. Project Setup

1. **Clone and Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

2. **Configure Environment Variables**

   **Backend (.env):**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and add your credentials:
   - MongoDB connection string
   - Cloudinary credentials
   - Generate a random JWT secret

   **Frontend (.env.local):**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   ```
   Edit `.env.local` and add:
   - Backend URLs (keep defaults for local development)
   - Cloudinary cloud name

3. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 4. Verify Setup

1. **Check MongoDB Connection**
   - Backend console should show "Connected to MongoDB"
   - No connection errors

2. **Check Cloudinary**
   - Try uploading an image when creating a room
   - Image should upload successfully

3. **Check TypeScript**
   - Run `npm run type-check` in both frontend and backend
   - Should complete without errors

## 5. Common Issues

### MongoDB Connection Failed
- Check your IP is whitelisted in Network Access
- Verify username and password are correct
- Ensure connection string is properly formatted

### Cloudinary Upload Failed
- Verify all three credentials are correct
- Check upload preset if using unsigned uploads
- Ensure file size is under limits

### TypeScript Errors
- Run `npm install` again to ensure all types are installed
- Check for any missing type definitions

## 6. Next Steps
- Create your first game room
- Test image upload functionality
- Invite friends to test multiplayer features