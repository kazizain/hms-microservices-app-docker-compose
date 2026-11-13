# HMS Microservices – Deployment Guide

This guide explains how to deploy the Hospital Management System (HMS), built with Spring Boot microservices and a React frontend.

It covers two deployment options:

1. Local deployment using Docker Compose.
2. Cloud deployment using Microsoft Azure Kubernetes Service (AKS).

This repository is a maintained fork of the original HMS project. The Azure deployment was completed as a hands-on learning exercise to understand containerization, CI/CD, Kubernetes orchestration, and cloud deployment.

---

## Project Architecture

| Component | Technology | Container Port |
|---|---|---:|
| Eureka Server | Spring Boot | 8761 |
| API Gateway | Spring Cloud Gateway | 9000 |
| UserMS, ProfileMS, Appointment, Pharmacy, Media | Spring Boot | 8080 |
| Frontend | React (Vite) + Nginx | 80 |
| Database | MySQL 8.0 | 3306 |

**Note:** The frontend container uses port 80. For the local Docker Compose setup, the frontend is accessed through `http://localhost:5173`, as configured in the Compose file.

---

## Option 1: Local Deployment Using Docker Compose

### Step 1: Clone the Repository

```bash
git clone https://github.com/kazizain/hms-microservices-app-docker-compose.git
```

Navigate to the project directory:

```bash
cd hms-microservices-app-docker-compose
```

### Step 2: Start the Application

Run the following command to deploy the application using Docker Compose:

```bash
docker compose -f docker-compose-for-local-test.yaml up
```

To run the application in detached mode:

```bash
docker compose -f docker-compose-for-local-test.yaml up -d
```

To build the application locally before deployment:

```bash
docker compose -f docker-compose-for-local-test.yaml up --build
```

### Step 3: Access the Application

Once the containers are running, access the frontend:

```text
http://localhost:5173
```

---

## Option 2: Cloud Deployment Using Azure Kubernetes Service (AKS)

The application was also deployed to Azure Kubernetes Service (AKS), using GitHub Actions to build Docker images and Docker Hub to store them.

### Deployment Architecture

```text
GitHub Repository
       |
       v
GitHub Actions
(Build Docker Images)
       |
       v
Docker Hub
       |
       v
Azure Kubernetes Service (AKS)
       |
       v
Application Frontend
```

### Step 1: Create Azure Resources

Create a resource group in Azure:

| Setting | Value |
|---|---|
| Resource Group | hms-rg |
| Region | East Asia |

An Azure Container Registry named `hmsregistry123` was also created. However, ACR Tasks were blocked on the subscription, so Docker images were built using GitHub Actions and stored on Docker Hub instead.

### Step 2: Create the AKS Cluster

Create an AKS cluster with the following configuration:

| Setting | Value |
|---|---|
| Cluster Name | hms-cluster |
| Node Size | Standard_D2as_v5 |
| Node Count | 2 |
| Scaling | Manual |
| Network | Azure CNI Overlay |
| Load Balancer | Standard |

Two D-series nodes were used because B-series VM sizes could not be scheduled in the system node pool, and one node did not provide enough capacity for the application services and MySQL.

### Step 3: Connect to the AKS Cluster

Open Azure Cloud Shell (Bash) and run:

```bash
az aks get-credentials \
  --resource-group hms-rg \
  --name hms-cluster \
  --overwrite-existing
```

Verify the cluster nodes:

```bash
kubectl get nodes
```

Both nodes should show `Ready`.

### Step 4: Configure Docker Hub Secrets

Create a Docker Hub personal access token with Read & Write permissions.

In your GitHub fork, navigate to:

`Settings → Secrets and variables → Actions`

Add the following repository secrets:

| Secret Name | Value |
|---|---|
| DOCKERHUB_USERNAME | Your Docker Hub username |
| DOCKERHUB_TOKEN | Your Docker Hub access token |

Do not commit access tokens or passwords to the repository.

### Step 5: Build and Push Docker Images

A GitHub Actions workflow was configured at:

```text
.github/workflows/build.yml
```

The workflow builds and pushes Docker images for these eight components:

- Eureka Server
- GatewayMS
- UserMS
- ProfileMS
- Appointment
- Pharmacy
- Media
- Frontend

The workflow uses the `workflow_dispatch` trigger, so it can be run manually.

To execute it:

1. Open the repository's **Actions** tab.
2. Select **build-images**.
3. Click **Run workflow**.
4. Wait for all jobs to complete successfully.

The images are pushed to Docker Hub using the `v1` tag.

### Step 6: Deploy Services to Kubernetes

The Kubernetes deployment was performed from Azure Cloud Shell.

Create the namespace and database secret:

```bash
kubectl create namespace hms

kubectl create secret generic hms-db \
  --from-literal=password=<YOUR-DB-PASSWORD> \
  -n hms
```

Create a working directory for the Kubernetes manifests:

```bash
mkdir -p ~/hms-k8s
cd ~/hms-k8s
```

The following Kubernetes resources were configured and deployed:

| Manifest | Purpose |
|---|---|
| mysql.yaml | MySQL database, persistent volume claim and initialization |
| eureka.yaml | Eureka service registry |
| gateway.yaml | API Gateway and LoadBalancer service |
| services.yaml | Backend microservices |
| frontend.yaml | Frontend deployment and LoadBalancer service |

Apply the manifests in the following order:

```bash
kubectl apply -f mysql.yaml
kubectl apply -f eureka.yaml
kubectl apply -f gateway.yaml
kubectl apply -f services.yaml
kubectl apply -f frontend.yaml
```

The MySQL initialization configuration creates the required application databases.

**Note:** These manifests were initially created in Azure Cloud Shell under `~/hms-k8s`. Their availability in this GitHub repository depends on whether they have subsequently been added to the repository.

### Step 7: Configure Frontend and CORS

After deploying the Gateway and Frontend, their public IP addresses were used for application communication.

The frontend API base URL was updated in:

```text
hms-app/FRONTEND/hms/src/Interceptor/AxiosInterceptor.tsx
```

The Gateway and backend CORS configurations were also updated to allow requests from the frontend public IP.

The following configurations were updated:

- Gateway: `application.properties`
- Backend services: `CorsConfig.java` in UserMS, Appointment, ProfileMS, Pharmacy and Media.

After committing these changes, the GitHub Actions workflow was executed again to rebuild the affected images.

Because the deployment reused the `v1` image tag, `imagePullPolicy: Always` and deployment restarts were used to pull the updated images.

### Step 8: Verify the Deployment

Check the Kubernetes nodes:

```bash
kubectl get nodes
```

Check the Kubernetes pods:

```bash
kubectl get pods -n hms
```

Check the deployments:

```bash
kubectl get deployments -n hms
```

Check the services and their external IP addresses:

```bash
kubectl get svc -n hms
```

The Java services may take a few minutes to start.

### Step 9: Test the Application

The application was tested through the deployed frontend.

The following functionality was verified:

- Frontend accessibility through its public IP.
- User registration through the API Gateway.
- User login.
- Doctor profile update.

The registration API was also tested using `curl` through the Gateway.

The registration request returned:

```json
{
  "message": "Account created"
}
```

The browser test confirmed that registration, login and doctor profile update were working successfully.

---

## Deployment Evidence

Screenshots captured during the Azure AKS deployment are maintained in the `docs/screenshots/` directory.

The evidence covers the following areas:

| Screenshot | Description |
|---|---|
| `01-aks-cluster-overview.png` | Azure AKS cluster overview |
| `02-aks-node-pool.png` | AKS node pool configuration |
| `03-kubernetes-workloads.png` | Kubernetes nodes, pods and deployments |
| `04-kubernetes-services.png` | Kubernetes services and external IP addresses |
| `05-github-actions.png` | GitHub Actions image build workflow |
| `06-dockerhub-images.png` | Published Docker Hub images |
| `07-application-login.png` | Application registration and login |
| `08-doctor-profile-update.png` | Doctor profile update verification |

These screenshots serve as evidence of the deployment and testing activities performed during the project.

---

## Troubleshooting and Lessons Learned

| Issue | Resolution |
|---|---|
| B-series node size could not be scheduled | Used Standard_D2as_v5 nodes |
| Azure Container Registry build failed | Used GitHub Actions and Docker Hub |
| Docker daemon unavailable on Mac | Used GitHub Actions for image builds |
| AKS authentication issue in a new Cloud Shell session | Re-ran `az aks get-credentials` |
| MySQL authentication error | Verified the password using the Kubernetes secret |
| CORS errors during login | Updated Gateway and backend CORS configurations |
| Old application image after a new build | Used `imagePullPolicy: Always` and restarted deployments |

---

## Azure Resource Cleanup

The AKS deployment was created for hands-on learning and practice.

After completing the deployment and verification activities, the Azure resources can be removed to avoid ongoing infrastructure charges.

To remove the complete deployment, delete the resource group:

```bash
az group delete --name hms-rg --yes --no-wait
```

Verify that the resource group has been deleted:

```bash
az group exists --name hms-rg
```

A `false` response indicates that the resource group no longer exists.

**Important:** Deleting the resource group removes the Azure resources contained within it. Confirm that you no longer need the cluster, disks, public IPs or other resources before proceeding. Separately created resources outside the resource group are not deleted by this command.

The deployment guide and screenshots are maintained in GitHub so the learning work and deployment process remain documented even after the Azure infrastructure is removed.

---

## Important Notes

- Replace placeholder passwords with your own secure values.
- Never commit credentials, tokens or secrets to GitHub.
- The Docker image tag used during this deployment was `v1`.
- The AKS deployment was completed and tested as a learning project.
- Azure public IP addresses used during testing are deployment-specific and may no longer be active.
- The Azure infrastructure may be deleted after testing to avoid ongoing costs.

## Acknowledgement

Original project: [Ashir-Qayyum/hms-microservices-app-docker-compose](https://github.com/Ashir-Qayyum/hms-microservices-app-docker-compose)

Maintained fork: [kazizain/hms-microservices-app-docker-compose](https://github.com/kazizain/hms-microservices-app-docker-compose)
