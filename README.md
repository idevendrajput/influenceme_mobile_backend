# InfluenceMe Mobile Backend

This is the backend server for the InfluenceMe mobile application. The server is built using Node.js, Express, and MongoDB, and provides APIs for user authentication, profile management, genre management, and application settings.

## Getting Started

To get started, ensure you have Node.js and MongoDB installed on your system. Copy the `.env.example` to `.env` and set the appropriate environment variables.

### Installation

```bash
npm install
```

### Running the Server

```bash
npm run dev
```

### Running in Production

```bash
npm start
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register`
  - Register a new user using phone number and/or email.
  - **Request Body**: `{ name, email, phone, password, ... }`

- **POST** `/api/auth/login`
  - Login with email/phone and password to receive a JWT token.
  - **Request Body**: `{ email, phone, password }`

- **POST** `/api/auth/check_user_exists`
  - Check if a user exists by phone or email before deciding to login or register.
  - **Request Body**: `{ email, phone }`


### User Profiles

- **GET** `/api/users/profile`
  - Get the authenticated user's profile.
  - **Auth Required**: Yes

- **PUT** `/api/users/profile`
  - Update the authenticated user's profile information.
  - **Auth Required**: Yes
  - **Request Body**: `{ name, email, country, ... }`

- **GET** `/api/users`
  - Retrieve all users with pagination and filtering options.

- **GET** `/api/users/:id`
  - Get user details by ID (admin only).

- **DELETE** `/api/users/:id`
  - Delete user by ID (admin only).


### Genres

- **GET** `/api/genres`
  - Retrieve all genres.

- **GET** `/api/genres/:id`
  - Get a specific genre by ID.

- **POST** `/api/genres`
  - Create a new genre (admin only).
  - **Auth Required**: Admin
  - **Request Body**: `{ name, icon, index }`

- **PUT** `/api/genres/:id`
  - Update an existing genre (admin only).
  - **Auth Required**: Admin
  - **Request Body**: `{ name, icon, index }`

- **DELETE** `/api/genres/:id`
  - Delete a genre (admin only).


### Settings

- **GET** `/api/settings`
  - Retrieve all settings (admin only).

- **GET** `/api/settings/:key`
  - Get a specific setting by key.

- **POST** `/api/settings`
  - Create a new setting (admin only).
  - **Request Body**: `{ key, title, content, ... }`

- **PUT** `/api/settings/:key`
  - Update an existing setting (admin only).

- **DELETE** `/api/settings/:key`
  - Delete a setting (admin only).

- **GET** `/api/settings/public`
  - Retrieve public settings for frontend usage.

## Environment Variables

Ensure to configure the `.env` file with appropriate values:

```plaintext
PORT=3001
MONGO_URI=<your_mongo_uri>
JWT_SECRET=<your_jwt_secret_key>
...
```

## Important Notes

- JWT is used for securing API endpoints.
- Ensure all security rules (e.g., admin-only routes) are properly handled in middleware.

