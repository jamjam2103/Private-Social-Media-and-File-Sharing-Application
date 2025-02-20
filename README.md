# Private-Social-Media-and-File-Sharing-Application
App for the Udhgam Woxsen University Hackathon

## SecureWhisper: Secure Collaboration Platform for Activists and Journalists

## Overview
This project is a secure collaboration platform designed for activists and journalists to communicate and share files safely. The platform leverages cutting-edge technologies to ensure privacy, security, and decentralization. Key features include:

- **Zero-Knowledge Proof Authentication**: Ensures that user credentials are never exposed, even to the server.
- **IPFS-based File Sharing**: Enables decentralized and tamper-proof file storage and sharing.
- **Signal Protocol for Chat**: Provides end-to-end encrypted messaging for secure communication.
- **React Frontend**: A modern and intuitive user interface.
- **TypeScript Backend**: A robust and type-safe backend system.

---

## Features

### 1. **Zero-Knowledge Proof Authentication**
   - Users can authenticate without revealing their passwords or sensitive information.
   - Built using cryptographic protocols to ensure maximum privacy.

### 2. **IPFS-based File Sharing**
   - Files are stored on the InterPlanetary File System (IPFS), ensuring decentralization and resilience.
   - Files are encrypted before being uploaded, ensuring only authorized users can access them.

### 3. **Signal Protocol for Chat**
   - End-to-end encrypted messaging ensures that only the intended recipients can read the messages.
   - Supports one-on-one chats currently.

### 4. **React Frontend**
   - A responsive and user-friendly interface built with React.
   - Easy to navigate and designed with activists and journalists in mind.

### 5. **TypeScript Backend**
   - A scalable and maintainable backend written in TypeScript.
   - Ensures type safety and reduces runtime errors.

---

## Tech Stack

### Frontend
- **React**: For building the user interface.
- **TailwindCSS**: For styling and components.

### Backend
- **Node.js**: Runtime environment.
- **TypeScript**: Primary programming language.
- **Express.js**: Web framework for building APIs.
- **IPFS**: For decentralized file storage.
- **Signal Protocol Library**: For end-to-end encrypted messaging.

---

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- IPFS node (local or remote)

### Installation

1. **Clone the Repository**
   ```bash
    git clone --recursive https://github.com/jamjam2103/Private-Social-Media-and-File-Sharing-Application.git
    cd Private-Social-Media-and-File-Sharing-Application
   ```
If the repository contains submodules, ensure they are properly initialized and updated:
   ```bash
   git submodule update --init --recursive
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the IPFS Node**
   ```bash
   ipfs daemon
   ```

4. **Start**
   ```bash
   npm run dev
   ```

---

## Usage

1. **Sign Up/Log In**: Use the zero-knowledge proof authentication system to create an account or log in.
2. **Chat**: Start a secure chat with other users using the Signal Protocol.
3. **Share Files**: Upload files to IPFS and share them with other users securely.
4. **Collaborate**: Use the platform to collaborate on sensitive projects with peace of mind.

---

## Acknowledgments
- **IPFS**: For decentralized file storage.
- **Signal Protocol**: For end-to-end encrypted messaging.
- **Zero-Knowledge Proof Libraries**: For secure authentication.

---

**Note**: This project is a proof of concept and should be thoroughly tested before being used in high-risk environments.