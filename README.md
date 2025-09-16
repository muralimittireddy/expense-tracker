# 💰 Expense Tracker

An all-in-one web application for personal finance management, designed to help you track expenses, set budgets, and easily split costs with friends or family.

---

## ✨ Features

- **User Authentication**: Secure user registration and login with a JSON Web Token (JWT)-based authentication system.  
- **Dashboard**: Get a quick overview of your finances with monthly spending trends and spending breakdown by category.  
- **Expense Management**: Log, view, edit, and delete personal and group expenses with filters by date range and category.  
- **Budget Tracking**: Set a monthly budget and track spending against it.  
- **Splits & Groups**: Create groups to manage shared expenses and calculate who owes whom.
- **Real-time Updates**: Websocket support for real-time updates on group expenses.

---

## 💻 Technologies

### Backend
- **Framework**: FastAPI  
- **Database**: PostgreSQL  
- **ORM**: SQLAlchemy  
- **Server & Dependencies**:  
  - `uvicorn` (ASGI server)  
  - `python-jose` (JWT handling)  
  - `passlib` (password hashing)  

### Frontend
- **Framework**: React  
- **Build Tool**: Vite  
- **Styling**: Tailwind CSS  
- **API Client**: Axios  
- **Web Server**: Nginx (for production builds)  

---

## 🔧 Setup and Installation

The project is containerized using **Docker** and **Docker Compose**.

### Prerequisites
- Docker  
- Docker Compose  

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/muralimittireddy/expense-tracker.git
   cd expense-tracker
2. **Create an .env file at the root**:
    - POSTGRES_DB=your_database_name
    - POSTGRES_USER=your_db_user
    - POSTGRES_PASSWORD=your_db_password
    - SECRET_KEY=a_very_secret_key
    - DOCKER_HUB_USERNAME=your_dockerhub_username
    - API_V1_STR=/api/v1
    - ACCESS_TOKEN_EXPIRE_MINUTES=30
    - GCP_HOST=your_gcp_vm_ip_or_domain
    - FRONTEND_PORT=80

⚠️ In production, this file is dynamically created by the CD pipeline.

3. **Run the application**:

  - Development:

        docker-compose up --build -d


  - Production:

        docker-compose -f docker-compose.prod.yaml up --build -d
    
4. **Access the application**:

    - Backend API → http://localhost:8000/api/v1
    
    - Frontend → http://localhost:5173

---

## 🚀 CI/CD Pipelines
  ### CI Pipeline (ci.yaml)

  - Triggered on push and pull_request to main.
  
  - Builds and pushes Docker images (frontend & backend) to Docker Hub.

  ### CD Pipeline (cd.yaml)
  
  - Triggered after CI pipeline completion on main.
  
  - Connects to GCP VM via SSH, pulls latest code, creates production .env, and redeploys using Docker Compose.
  
Workflows are located in .github/workflows/.

---

## 📂 Project Structure
    .
    ├── .github/                 # GitHub Actions workflows
    ├── backend/                 # FastAPI backend source code
    │   ├── app/
    │   │   ├── api/             # API routers and dependencies
    │   │   ├── core/            # Configuration, security, and exceptions
    │   │   ├── db/              # Database models, CRUD, and session management
    │   │   ├── schemas/         # Pydantic models for data validation
    │   │   └── services/        # Business logic and database interactions
    │   ├── Dockerfile           # Dockerfile for the backend application
    │   ├── init.sql             # SQL script for database initialization
    │   └── requirements.txt     # Python dependencies
    ├── frontend/                # React frontend source code
    │   ├── public/
    │   ├── src/
    │   │   ├── api/             # API client setup (Axios)
    │   │   ├── components/      # Reusable React components
    │   │   ├── contexts/        # React context for authentication
    │   │   ├── hooks/           # Custom React hooks
    │   │   ├── pages/           # Page components
    │   │   └── utils/           # Utility functions
    │   ├── Dockerfile           # Dockerfile for the frontend
    │   ├── nginx.conf           # Nginx configuration for serving the app
    │   ├── package.json         # Node.js dependencies
    │   └── tailwind.config.js   # Tailwind CSS configuration
    ├── .gitignore               # Files and directories to ignore
    ├── docker-compose.prod.yaml # Production Docker Compose configuration
    ├── docker-compose.yaml      # Development Docker Compose configuration
    ├── .env.example             # Example environment file
    └── README.md                # Project README file (this file)

---

## 🌟 Contributing
  Contributions are welcome! Feel free to open issues or submit PRs.
