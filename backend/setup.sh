#!/bin/bash
# Lion School Django Backend Setup Script
# Automated setup for development environment

set -e

echo "🚀 Starting Lion School Backend Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠ Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Django Settings
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=lion_school
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please update .env with your database credentials${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
fi
echo ""

# Copy settings if needed
if [ ! -f "lion_school/settings.py" ]; then
    echo "Copying Django settings template..."
    cp settings_template.py lion_school/settings.py 2>/dev/null || echo -e "${YELLOW}⚠ Please copy settings_template.py to settings.py${NC}"
fi
echo ""

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Create superuser
echo "Creating superuser..."
echo "Please enter superuser credentials:"
python manage.py createsuperuser
echo -e "${GREEN}✓ Superuser created${NC}"
echo ""

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput
echo -e "${GREEN}✓ Static files collected${NC}"
echo ""

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run development server: python manage.py runserver"
echo "3. Access admin panel: http://localhost:8000/admin"
echo "4. API available at: http://localhost:8000/api"
echo ""
echo "Database Setup (PostgreSQL):"
echo "1. Create database: createdb lion_school"
echo "2. Update DB credentials in .env file"
echo "3. Run migrations again: python manage.py migrate"
