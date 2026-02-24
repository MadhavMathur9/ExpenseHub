# ExpenseHub

**Live Demo:** [https://my-expensehub.netlify.app](https://my-expensehub.netlify.app)

ExpenseHub is a full-stack personal finance tracker built to help users manage their income, expenses, and savings goals. The application includes a financial dashboard, a custom AI advisor (using the Google Gemini API), and secure authentication handled by Keycloak.

---

## Key Features

*   **Financial Dashboard:** Track income and expenses visually with interactive charts and a real-time balance breakdown.
*   **Goal Tracking:** Create savings goals and track your progress over time.
*   **AI Insights:** Uses the Google Gemini API to analyze your spending history and provide actionable tips to save money.
*   **Authentication:** OAuth2 / OpenID Connect login managed entirely by Keycloak, including options for SSO (Google/Microsoft).
*   **Categorization:** Group transactions by category and export the data to Excel for your personal records.

---

## Tech Stack

### Frontend (Deployed on Netlify)
*   React 19, TypeScript, and Vite
*   Tailwind CSS for styling
*   Framer Motion and Recharts for animations and data visualization

### Backend (Deployed on Railway)
*   Java 21 with Spring Boot 3
*   Spring Security (configured as an OAuth2 Resource Server)
*   Spring Data JPA & Hibernate
*   PostgreSQL database
*   Keycloak 24+ for Identity Management

### Integrations
*   Google Gemini AI API 

---

## How Authentication Works

The app uses a standard OAuth2 flow:
1.  **Keycloak:** All user accounts, passwords, and SSO integrations are stored in Keycloak, keeping credentials out of the main database.
2.  **JWT Tokens:** When a user logs in, Keycloak generates an RSA-signed JSON Web Token (JWT).
3.  **Validation:** The Spring Boot backend intercepts incoming API requests, fetches the public keys from Keycloak, and validates the token signature before allowing access to the protected routes.

---

## Local Setup

To run this project on your own machine, you need Java 21, Node.js 20+, and Docker.

### 1. Start the Database & Keycloak
Use Docker to spin up local instances of PostgreSQL and Keycloak:
```bash
cd ExpenseHub
docker-compose up -d
```

### 2. Run the Spring Boot Server
Make sure your local `application.properties` points to your local database.
```bash
cd ExpenseHub
mvn spring-boot:run
```

### 3. Run the React Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Then go to `http://localhost:5173` in your browser.

---

## Author
**Madhav Mathur**
