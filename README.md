# Survey Application - GenVoice Technical Screening

This is a full-stack web application developed for the GenVoice technical screening. It fulfills the requirements outlined in the task description, including mock authentication, user registration, survey CRUD functionality with voice input, user settings, and admin user management.

## Features

* **User Registration:**
    * Ability to create new user accounts with username and password.
* **Survey Management (CRUD):**
    * Display of completed surveys in a table.
    * Ability to view, update, and delete survey entries.
    * Ability to create new survey entries.
* **Voice Input Surveys:**
    * Surveys consist of two questions.
    * Answers to survey questions must be provided via voice input.
* **Personal Write-up:**
    * A section about my skills and experience.
* **User Settings:**
    * A settings page where users can change their passwords.
* **Admin User Management:**
    * A dedicated admin page for CRUD operations on all user accounts.

## Technologies Used

* **Frontend:**
    * Next.js
    * React
* **Voice Input:**
    * RecordRTC
* **Database:**
    * Firebase Firestore
* **Deployment:**
    * Vercel

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/andreleocl/survey-app.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd survey-app
    ```
3.  **Install dependencies:**
    * `npm install` or `yarn install`
4.  **Run the application:**
    * `npm run dev` or `yarn dev`

## Deployment

The application is deployed at: https://survey-app-rose.vercel.app/

## Author

* Andre Leo - https://github.com/andreleocl
