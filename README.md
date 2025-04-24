# 🚀 Node.js "Hello World" on App Engine Flex with Docker & GitHub Actions CI/CD

This guide outlines the steps to deploy a Node.js application to Google Cloud Platform's App Engine Flexible environment using Docker and GitHub Actions for CI/CD. ✨

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

## 2. 💻 Create the Express "Hello, World!" App

1. Initialize a new Node.js project:
```
mkdir hello-express && cd hello-express
npm init -y
npm install express
```

2. Create the main application file (`index.js`) with a basic Express server

3. Update `package.json` to include a start script:
```
"scripts": {
  "start": "node index.js"
}
```

## 3. 🐳 Dockerize the App

1. Create a `Dockerfile` for your application

2. Create a `.dockerignore` file:
```
node_modules
npm-debug.log*
.DS_Store
```

## 4. ⚙️ Configure App Engine Flex

1. Create an `app.yaml` file with custom runtime configuration:
```
runtime: custom
env: flex
```

## 5. 🧪 Local Testing

1. Build and run your Docker container:
```
docker build -t hello-express-app .
docker run --rm -p 8080:8080 hello-express-app
```

2. Test by visiting `http://localhost:8080`

## 6. ☁️ Google Cloud CLI Setup

1. Initialize and login to Google Cloud:
```
gcloud init --no-launch-browser
# or simply: gcloud init
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

### 🔧 Troubleshooting Notes

- If you encounter `PERMISSION_DENIED`, link a billing account:
```
gcloud beta billing projects link $PROJECT_ID \
    --billing-account=YOUR_BILLING_ACCOUNT_ID
```

- If `gcloud init` errors in WSL, use `--no-launch-browser` or install chromium/xdg-utils

- Update SDK if needed: `gcloud components update`

## 7. 🚢 Deploy Manually

1. Deploy your application:
```
gcloud app deploy --quiet
```

2. Open your deployed application:
```
gcloud app browse
```

3. Inspect which image is running:
```
gcloud app versions list \
  --service=default \
  --format="table(id, deployment.container.image)"
```

## 8. 🔄 GitHub Actions CI/CD Setup

### 8.1. 🔐 Create & Store Secrets

1. Create service account key JSON and store it as GitHub Secret `GCP_SA_KEY`
2. Store your Project ID as GitHub Secret `GCP_PROJECT_ID`
3. Optionally create an Environment named `hello-express` or place secrets in Repository scope

### 8.2. 📄 Create Workflow File

1. Create a workflow file at `.github/workflows/ci-cd-pipeline.yml` with build and deploy jobs

### 🔑 Key Configuration Points

- Use `needs: build-and-push` to ensure deploy only runs on successful build
- Include `actions/checkout` in each job to access app.yaml & Dockerfile
- Enable App Engine Admin API before deployment
- Correctly use environment or repository secrets

## 9. 📝 Post-Setup Notes

- Folders in GCP require an Organization
- View resource inventory:
```
gcloud asset search-all-resources --scope=projects/$PROJECT_ID
```

- View logs:
```
gcloud app logs tail -s default
```

- Customize scaling and settings by updating `app.yaml` with parameters like `max_instances`, `resources`, and health check configurations

- For Error 13, use `--verbosity=debug` and inspect Cloud Build logs

- Keep Google Cloud SDK on WSL filesystem (not under `/mnt/c`) for best performance 

---

## 🎉 Congratulations!

You now have a fully automated CI/CD pipeline that builds your Node.js Express app, packages it with Docker, pushes to Artifact Registry, and deploys to App Engine Flex—all hands-off on each push to your repository!
