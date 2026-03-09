#!/bin/bash

# Lion School Quick Start Script
# Sets up both frontend and backend for development

set -e

echo "=================================="
echo "   Lion School Quick Start"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ask for setup preference
echo "What would you like to set up?"
echo "1) Frontend only"
echo "2) Backend only"
echo "3) Both (recommended)"
read -p "Enter choice (1-3): " choice

# ============================================================================
# FRONTEND SETUP
# ============================================================================

setup_frontend() {
    echo ""
    echo -e "${BLUE}=== Setting up Frontend ===${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        echo "Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    
    # Create .env.local
    if [ ! -f ".env.local" ]; then
        echo "Creating .env.local..."
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF
        echo -e "${GREEN}✓ .env.local created${NC}"
    else
        echo -e "${YELLOW}⚠ .env.local already exists${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}Frontend setup complete!${NC}"
    echo -e "${BLUE}Start with: npm run dev${NC}"
    echo -e "Frontend will be available at: http://localhost:3000"
    echo ""
}

# ============================================================================
# BACKEND SETUP
# ============================================================================

setup_backend() {
    echo ""
    echo -e "${BLUE}=== Setting up Backend ===${NC}"
    
    cd backend
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed"
        echo "Please install Python 3.10+ from https://python.org"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${YELLOW}⚠ Virtual environment already exists${NC}"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing dependencies..."
    pip install --upgrade pip setuptools wheel > /dev/null 2>&1
    pip install -r requirements.txt > /dev/null 2>&1
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    
    # Create .env
    if [ ! -f ".env" ]; then
        echo "Creating .env..."
        cat > .env << EOF
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production-$(openssl rand -hex 16)
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=django.db.backends.postgresql
DB_NAME=lion_school
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
        echo -e "${GREEN}✓ .env created${NC}"
        echo -e "${YELLOW}⚠ Update database credentials in .env${NC}"
    else
        echo -e "${YELLOW}⚠ .env already exists${NC}"
    fi
    
    # Copy settings if needed
    if [ ! -f "lion_school/settings.py" ]; then
        echo "Copying Django settings..."
        cp settings_template.py lion_school/settings.py
        echo -e "${GREEN}✓ Settings copied${NC}"
    fi
    
    # Database setup
    echo ""
    echo -e "${BLUE}Database Setup${NC}"
    echo "Please ensure PostgreSQL is running and the database exists:"
    echo "  createdb lion_school"
    echo ""
    read -p "Press Enter once database is ready..."
    
    echo "Running migrations..."
    python manage.py makemigrations
    python manage.py migrate
    echo -e "${GREEN}✓ Migrations completed${NC}"
    
    # Create superuser
    echo ""
    echo "Creating superuser for Django admin..."
    python manage.py createsuperuser
    
    cd ..
    
    echo ""
    echo -e "${GREEN}Backend setup complete!${NC}"
    echo -e "${BLUE}Start with: cd backend && source venv/bin/activate && python manage.py runserver${NC}"
    echo -e "Backend API will be available at: http://localhost:8000/api"
    echo -e "Admin panel at: http://localhost:8000/admin"
    echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

case $choice in
    1)
        setup_frontend
        ;;
    2)
        setup_backend
        ;;
    3)
        setup_frontend
        setup_backend
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Frontend: npm run dev"
echo "2. Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "Access the platform at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000/api"
echo "- Django Admin: http://localhost:8000/admin"
echo ""
echo "Demo Credentials (create via registration first time):"
echo "- Email: student@example.com / lecturer@example.com"
echo "- Password: password123"
echo ""
echo "Documentation:"
echo "- Main README: README.md"
echo "- Implementation Guide: IMPLEMENTATION_GUIDE.md"
echo "- Project Summary: PROJECT_SUMMARY.md"
echo ""
