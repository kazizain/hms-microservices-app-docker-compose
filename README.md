# HMS Microservices on Azure AKS

I deployed this Hospital Management System (Spring Boot microservices + React + MySQL)
on Azure Kubernetes Service (AKS) as a learning project.

**Flow:** GitHub Actions -> Docker Hub -> AKS -> Browser

**What I did**
- Created an AKS cluster (2 nodes, Standard_D2as_v5)
- Built 8 Docker images with GitHub Actions and pushed them to Docker Hub
- Deployed MySQL, Eureka, API Gateway, 5 backend services and the React frontend
- Used Kubernetes Secrets for the database password
- Exposed the gateway and frontend with LoadBalancer services
- Fixed CORS errors in the gateway and in 5 backend services

**Problems I solved**
- B-series node size not allowed in the system node pool
- ACR Tasks blocked, so images are built with GitHub Actions
- CORS errors (gateway and each service have their own CORS config)
- Old image reused because the tag stayed v1 (fixed with imagePullPolicy: Always)

**Files**
- `k8s/` Kubernetes YAML files
- `.github/workflows/build.yml` image build workflow
- `docs/` deployment guide and screenshots

The test deployment was deleted to avoid cost. IPs in the code (`52.246.137.53`, `20.239.225.142`) were from that deployment.

Original application and docker-compose setup: https://github.com/Ashir-Qayyum/hms-microservices-app-docker-compose
