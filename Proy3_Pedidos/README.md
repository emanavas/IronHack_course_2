# Project 2 - Ironhack Web Development Bootcamp

## Description

This is the second project for the Ironhack Web Development Bootcamp, Module 2. It is a web application built with Node.js and Express that serves as a small demo for a course management system. It features a full CRUD (Create, Read, Update, Delete) system for courses, user management with roles (admin and regular user), and session handling.

## Features

*   **User Authentication**: Secure user registration and login system.
*   **Role-Based Access**: Differentiated access for regular users and administrators. Admins can manage all courses.
*   **Course Management (CRUD)**: Authenticated users can create, read, update, and delete their own courses.
*   **Image Uploads**: Support for uploading course images, which are stored in the database.
*   **Course Visibility**: Courses can be set as public (visible to everyone) or private (visible only to the creator).
*   **Dynamic Views**: Server-side rendered views using EJS.

## Technologies Used

*   **Backend**: Node.js, Express.js
*   **Database**: SQLite with Sequelize as the ORM.
*   **View Engine**: EJS (Embedded JavaScript templates) for dynamic view rendering.
*   **Authentication & Sessions**:
    *   `express-session` for session management.
    *   `jsonwebtoken` for creating and verifying access tokens.
    *   `bcrypt` for secure password hashing.
*   **Middleware**:
    *   `express-validator` for server-side data validation.
    *   `multer` for handling `multipart/form-data`, used for image uploads.
*   **Environment Variables**: `dotenv` for managing environment-specific configurations.

## Installation and Usage

Follow these steps to get the project up and running on your local environment:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/emanavas/IronHack_course_2.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd Proy2_Cursos
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your environment variables:**
    Create a `.env` file in the root directory and add the necessary variables (e.g., `TOKEN_SECRET`).
    ```
    TOKEN_SECRET=your_super_secret_jwt_key
    ```

5.  **Start the application:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3002` (or the port you have configured).

## Project Structure

```
/ 
|-- config/ # Configuration files (database, main config). 
|-- models/ # Sequelize models for the database (User, Course). 
|-- node_modules/ # Project dependencies. 
|-- public/ # Static files (CSS, client-side JS, images). 
|-- routers/ # Route definitions for the application (courses, login, etc.). 
|-- views/ # EJS templates for the views. 
| |-- partials/ # Reusable view components (navbar, footer). 
|-- .env # Environment variables (not committed to Git). 
|-- .gitignore # Files ignored by Git. 
|-- index.js # Main application entry point. 
|-- package.json # Project metadata and dependencies. 
|-- README.md # This file.
```

## Autor

*   **Emanuel Navas** 