# Bipolar Tracking

A comprehensive web application designed to help individuals track and manage their bipolar disorder symptoms, moods, check-ins, and overall well-being. The project uses a modern frontend framework paired with a robust backend API and SQLite database.

## Technology Stack

### Frontend
- **Framework**: Angular 21
- **Testing**: Vitest (Unit Testing)
- **Data Visualization**: Chart.js (`ng2-charts`)
- **Package Manager**: NPM

### Backend
- **Framework**: ASP.NET Core 8 API
- **ORM**: Entity Framework Core
- **Database**: SQLite
- **Documentation**: Swagger/OpenAPI

## AI Assistance & Development

This project was built with the assistance of advanced AI coding agents and models.
- **AI Coding Agents**: Google Antigravity & GitHub Copilot
- **Underlying Models**: Gemini 3.1 & Claude 4.6

The AI integration enabled rapid test-driven development (TDD), efficient scaffolding, robust unit test generation, and seamless component integration following standard Angular style guidelines.

## Prerequisites

- **Node.js**: (>= 18.x)
- **.NET SDK**: (>= 8.0)
- **Angular CLI**: (Optional but recommended)

## Installation and Setup Instructions

### 1. Backend Setup (ASP.NET Core API)

First, initialize the backend database and start the API server so the frontend has a reliable data source.

1. Navigate to the API directory:
   ```bash
   cd BipolarTracking.Api/BipolarTracking.Api
   ```
2. Apply Entity Framework migrations to create the local SQLite database:
   ```bash
   dotnet ef database update
   ```
3. Run the development server:
   ```bash
   dotnet run
   ```
   > By default, the API typically runs on `https://localhost:7157` (check the console output for the exact URL). Swagger documentation will be available at `https://localhost:<port>/swagger`.

### 2. Frontend Setup (Angular)

In a new terminal window, initialize and run the frontend application.

1. Navigate to the project root directory:
   ```bash
   cd /path/to/bipolar-tracking
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   # or
   npx ng serve --open
   ```
   > The application will automatically open in your default browser at `http://localhost:4200/`.

## Testing

This project adheres explicitly to the principles of Test-Driven Development (TDD).

### Running Frontend Tests
Vitest has been configured as the primary testing framework. To run the test suite:

```bash
npm run test
```

## Linting and Building

- **Linting**: Ensure code conforms to the Angular style guidelines and best practices.
  ```bash
  npm run lint
  ```
- **Production Build**: Compiles the application into the `dist/` folder for deployment.
  ```bash
  npm run build
  ```
