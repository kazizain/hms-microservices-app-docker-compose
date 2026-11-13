# HMS Microservices on Azure AKS

I deployed this Hospital Management System (Spring Boot microservices + React + MySQL) on Azure Kubernetes Service (AKS) as a hands-on cloud and DevOps learning project.

**Architecture Flow:** GitHub Actions → Docker Hub → Azure AKS → Browser

## What I Did

- Created an Azure Kubernetes Service (AKS) cluster with 2 nodes (Standard_D2as_v5).
- Built 8 application Docker images using GitHub Actions and pushed them to Docker Hub.
- Deployed MySQL, Eureka Server, API Gateway, 5 backend microservices, and React frontend.
- Configured Kubernetes Deployments, Services, ConfigMaps, Secrets, and Persistent Volume Claims.
- Exposed the API Gateway and frontend using Azure LoadBalancer services.
- Configured database credentials using Kubernetes Secrets.
- Resolved CORS issues across the gateway and 5 backend services.

## Problems I Solved

- B-series VM size was not allowed for the AKS system node pool.
- Azure Container Registry Tasks were unavailable, so I moved image builds to GitHub Actions.
- Resolved CORS errors in the gateway and individual backend services.
- Fixed stale Docker image issues by using `imagePullPolicy: Always` and updating image tags.

## Kubernetes Deployment

The Kubernetes deployment configuration is maintained in the `k8s/` directory.

- Kubernetes Deployments and Services
- ConfigMaps and database initialization configuration
- Persistent Volume Claim for MySQL
- Namespace configuration

## CI/CD

- GitHub Actions workflow: `.github/workflows/build.yml`
- Docker images published to Docker Hub.
- Kubernetes deployment performed on Azure AKS.

## Deployment Status

The AKS deployment was verified with 2 Ready nodes and 9/9 healthy application deployments during the latest verification.

The environment is a learning/test deployment. Azure resources may be stopped or deleted to manage cloud costs.

## Documentation

Deployment guide and screenshots are available in the `docs/` directory.

## Original Application

Original application and Docker Compose setup:

https://github.com/Ashir-Qayyum/hms-microservices-app-docker-compose
