# 🌐 ResiliNet Civic Protocol

This project is a decentralized civic protocol platform developed for the hackathon. The application is fully deployed and production-ready for users to interact with.

## 🚀 Live Deployment
* **Frontend URL:** [https://resili-net-civic-protocol.vercel.app]

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend & Database:** Firebase (Authentication, Firestore / Realtime Database)
* **Hosting & Deployment:** Vercel

---

## 🏗️ Architecture & Integration

### 1. Frontend (Vercel)
Our frontend is fully hosted on **Vercel**, integrated with a CI/CD pipeline. Every time code is pushed to the `main` branch on GitHub, Vercel automatically triggers a production build and updates the live site instantly.

### 2. Backend & Database (Firebase)
* **User Authentication:** Firebase Auth is implemented to handle secure user sign-ups, logins, and identity verification.
* **Database & Storage:** Real-time user submissions, civic protocol interactions, and data logs are securely routed and stored directly inside our Firebase environment.
* **Integration:** The frontend seamlessly communicates with the backend services through a dedicated `firebase.ts` configuration layer.

---

## 💻 Local Setup & Installation

To run this project locally on your machine, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/golugautam64602-stack/ResiliNet-civic-protocol.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ResiliNet-civic-protocol
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
   *(The application will be running locally at `http://localhost:5173`)*
