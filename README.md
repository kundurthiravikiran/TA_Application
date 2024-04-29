# TA Management Web App

## Overview

The TA Management Web App is an innovative solution tailored for educational institutions to streamline the management and allocation of teaching assistants. It's built using Node.js and React.js, with Firebase as the database, ensuring a seamless and interactive experience for users across various roles including students, department staff, TA committee members, and instructors.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

- `JWT_SECRET` - A secret key for JWT authentication. This should be a long, random string of characters, used to sign and verify JWT tokens.
- `SERVICEACCOUNTTOKEN` - The token for accessing Firebase services. This should be your Firebase service account token.

Ensure these variables are set before running the app to ensure all functionalities work as expected.

## Pre-requisites

- Node.js
- npm

## Installation

1. Clone the repository:

```bash
  git clone https://github.com/pganesh2023/ta-management.git
```

2. Navigate to the project directory:

```bash
  cd ta-management
```

3. Install dependencies:

```bash
  npm install
  cd Frontend && npm install && npm build
```

## Running the App

To run the app, run the following command in the project directory:

```bash
  node app.js
```
