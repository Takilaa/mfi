# 🚀 MFI Portal Installation Guide

## Prerequisites

- **PHP 8.2+** with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- **Composer** (PHP package manager)
- **Node.js 18+** and **npm**
- **MySQL 8.0+** or **PostgreSQL 13+**
- **Git**

## Quick Start

### 1. Install Laravel Framework

Since Laravel wasn't installed yet, let's set it up properly:

```bash
# Navigate to project directory
cd /Users/Mac/CascadeProjects/mfi-portal

# First, install Composer if not available
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Create Laravel project (this will overwrite existing files)
composer create-project laravel/laravel . --prefer-dist

# Install additional required packages
composer require laravel/sanctum spatie/laravel-permission phpoffice/phpword maatwebsite/excel smalot/pdfparser barryvdh/laravel-dompdf aws/aws-sdk-php
```

### 2. Copy Project Files

After Laravel installation, copy our custom files:

```bash
# Copy models, controllers, services, and migrations from the created files
# (You'll need to manually copy the files we created earlier)
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create storage directories
mkdir -p storage/app/documents
mkdir -p storage/app/reports
mkdir -p storage/app/templates
```

### 4. Database Configuration

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mfi_portal
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Create database and run migrations:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE mfi_portal;"

# Run migrations and seeders
php artisan migrate --seed

# Publish Spatie permissions
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### 5. AI Services Configuration

Choose and configure your AI provider in `.env`:

#### Option A: AWS Textract
```env
AI_PROVIDER=textract
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1
```

#### Option B: Google Document AI
```env
AI_PROVIDER=document_ai
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_LOCATION=us
GOOGLE_CLOUD_PROCESSOR_ID=your_processor_id
GOOGLE_CLOUD_CREDENTIALS_PATH=/path/to/credentials.json
```

#### Option C: Azure Form Recognizer
```env
AI_PROVIDER=form_recognizer
AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_FORM_RECOGNIZER_KEY=your_subscription_key
```

### 6. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 7. Start Laravel Backend

```bash
# In the root directory
php artisan serve
```

## 🔧 Production Setup

### 1. Environment Configuration

```bash
# Set production environment
APP_ENV=production
APP_DEBUG=false

# Configure secure session
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true

# Setup queue for background processing
QUEUE_CONNECTION=database
```

### 2. Optimize Application

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### 3. Setup Queue Worker

```bash
# Start queue worker (use supervisor in production)
php artisan queue:work --daemon
```

### 4. File Storage (Production)

For production, configure S3 storage:

```env
FILESYSTEM_DISK=s3
AWS_BUCKET=your-s3-bucket
AWS_USE_PATH_STYLE_ENDPOINT=false
```

## 📋 Default Users

The system comes with pre-configured users:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Super User | admin@mfiportal.com | password123 | System administrator |
| Registrar | registrar@rbz.co.zw | password123 | RBZ banking supervisor |
| Applicant | applicant@microfinance.co.zw | password123 | Sample MFI applicant |

## 🔍 Testing the System

### 1. Login as Applicant
- Navigate to `http://localhost:3000`
- Login with applicant credentials
- Create new application
- Upload documents using the wizard

### 2. Test AI Processing
- Upload a sample PDF document
- Check processing status in real-time
- Verify extracted data appears in form

### 3. Login as Registrar
- Access registrar dashboard
- Review submitted applications
- Generate evaluation reports

## 🛠️ Troubleshooting

### Common Issues

**1. Storage Permission Errors**
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

**2. Database Connection Issues**
- Verify database credentials in `.env`
- Ensure database server is running
- Check firewall settings

**3. AI Processing Failures**
- Verify API credentials are correct
- Check internet connectivity
- Review logs: `tail -f storage/logs/laravel.log`

**4. Frontend Build Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

**1. Enable OPcache (Production)**
```ini
; php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
```

**2. Database Indexing**
```sql
-- Add indexes for better performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_extraction_status ON documents(extraction_status);
```

## 📚 API Documentation

The system provides RESTful APIs. Key endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/applications` - List applications
- `POST /api/documents/upload` - Upload documents
- `POST /api/reports/applications/{id}/evaluation` - Generate reports

## 🔐 Security Considerations

1. **Change default passwords** in production
2. **Configure HTTPS** with valid SSL certificates
3. **Set up firewall rules** to restrict access
4. **Regular backups** of database and uploaded files
5. **Monitor logs** for suspicious activities

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review application logs in `storage/logs/`
- Ensure all dependencies are properly installed