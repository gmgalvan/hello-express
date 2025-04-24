# 🚀 Node.js App on App Engine Flex with Docker & GitHub Actions CI/CD

This guide outlines the steps to deploy a Node.js application to Google Cloud Platform's App Engine Flexible environment using Docker and GitHub Actions for CI/CD with separate development and production environments. ✨

## 1. 📋 Prerequisites

- **Local tools required:**  
  - Node.js v18+  
  - Docker Engine (or Docker Desktop)  
  - Google Cloud SDK (`gcloud`)  

- **GCP setup requirements:**  
  - A Google Cloud Project with **Billing enabled**  
  - IAM roles for your user/Service Account:  
    - **Owner** on the project  
    - **Billing Account User** (to link billing)  
    - **Artifact Registry Writer** (to push images)  
    - **App Engine Deployer** (to deploy)  
    - **Service Usage Admin** (for enabling APIs in CI)  

## 2. 💻 Create the Express App

1. Initialize a new Node.js project:
```
mkdir hello-express && cd hello-express
npm init -y
npm install express
```

2. Create the main application file (`index.js`) with a basic Express server that includes environment information.

3. Update `package.json` to include a start script.

## 3. 🐳 Dockerize the App

1. Create a `Dockerfile` for your application that accepts a NODE_ENV build argument.

2. Create a `.dockerignore` file to exclude unnecessary files.

## 4. ⚙️ Configure App Engine Flex for Multiple Environments

1. Create an `app.dev.yaml` file for the development environment with:
   - `service: development`
   - Appropriate scaling settings
   - `NODE_ENV: development` in environment variables

2. Create an `app.prod.yaml` file for the production environment with:
   - `service: default`
   - Production-appropriate scaling settings
   - `NODE_ENV: production` in environment variables

## 5. 🧪 Local Testing

1. Build and run your Docker container with the development environment:
```
docker build -t hello-express-app --build-arg NODE_ENV=development .
docker run --rm -p 8080:8080 hello-express-app
```

2. Test by visiting:
   - `http://localhost:8080` - Main application
   - `http://localhost:8080/health` - Health check
   - `http://localhost:8080/environment` - Environment info

## 6. ☁️ Google Cloud CLI Setup

1. Initialize and login to Google Cloud:
```
gcloud init --no-launch-browser
```

2. Set your project:
```
gcloud config set project YOUR_PROJECT_ID
```

3. Enable required APIs and create App Engine application:
```
gcloud services enable appengine.googleapis.com \
                     cloudbuild.googleapis.com \
                     artifactregistry.googleapis.com

gcloud app create --region=us-central
```

4. Create Artifact Registry repository:
```
gcloud artifacts repositories create hello-repo \
    --repository-format=docker \
    --location=us-central1
```

### 🔧 Troubleshooting Notes

- If you encounter `PERMISSION_DENIED`, link a billing account:
```
gcloud beta billing projects link $PROJECT_ID \
    --billing-account=YOUR_BILLING_ACCOUNT_ID
```

- If `gcloud init` errors in WSL, use `--no-launch-browser` or install chromium/xdg-utils

- Update SDK if needed: 
```
gcloud components update
```

## 7. 🚢 Manual Deployment to Different Environments

1. Build Docker images for both environments:
```
# Build development image
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hello-repo/hello-express:dev-manual \
  --build-arg NODE_ENV=development .

# Build production image
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hello-repo/hello-express:prod-manual \
  --build-arg NODE_ENV=production .
```

2. Push images to Artifact Registry:
```
# Authenticate Docker to Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Push development image
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hello-repo/hello-express:dev-manual

# Push production image
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hello-repo/hello-express:prod-manual
```

3. Deploy to development environment:
```
gcloud app deploy app.dev.yaml \
  --image-url=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hello-repo/hello-express:dev-manual
```

4. Deploy to production environment:
```
gcloud app deploy app.prod.yaml \
  --image-url=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hello-repo/hello-express:prod-manual
```

5. Access your environments:
   - Development: `https://development-dot-YOUR_PROJECT_ID.appspot.com`
   - Production: `https://YOUR_PROJECT_ID.appspot.com`

6. Managing environment costs:
   - Stop development environment when not in use:
   ```
   gcloud app services stop development
   ```
   - Start development environment when needed:
   ```
   gcloud app services start development
   ```

## 8. 🔄 GitHub Actions CI/CD Setup for Multiple Environments

### 8.1. 🔐 Create & Store Secrets

1. Create service account key:
```
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/owner"

gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

2. Add GitHub Secrets:
   - Create `GCP_SA_KEY` with contents of key.json
   - Create `GCP_PROJECT_ID` with your project ID

3. Create GitHub Environments:
   - `development` - For develop branch deployments
   - `production` - For master branch deployments (can add protection rules)

### 8.2. 📄 Create Workflow File

1. Create a workflow file at `.github/workflows/ci-cd-pipeline.yml`

## 9. 📝 Environment Management

### Branch Strategy
- **develop branch**: Changes here deploy to the development environment
- **master branch**: Changes here deploy to the production environment

### Accessing Environments
- Development: `https://development-dot-YOUR_PROJECT_ID.appspot.com`
- Production: `https://YOUR_PROJECT_ID.appspot.com`

### Environment Endpoints
- `/environment` - Shows current environment details
- `/health` - Health check endpoint

### Cost Management
To save costs for the development environment when not in use:
```
gcloud app services stop development
```

To start it again when needed:
```
gcloud app services start development
```

## 10. 🔍 Monitoring and Troubleshooting

- View logs for specific environments:
```
# Development logs
gcloud app logs tail -s development

# Production logs
gcloud app logs tail -s default
```

- View deployed versions in each environment:
```
# Development versions
gcloud app versions list --service=development

# Production versions
gcloud app versions list --service=default
```

- Check resource usage and billing:
```
# View App Engine resource usage
gcloud app instances list --service=development
gcloud app instances list --service=default

# View current resource quotas
gcloud compute project-info describe --format="yaml(quotas)"
```

- View existing services:
```
gcloud app services list
```

---

## 🎉 Congratulations!

You now have a fully automated CI/CD pipeline with separate development and production environments. Each push to develop or master will automatically build, deploy, and run your application in the appropriate environment!
