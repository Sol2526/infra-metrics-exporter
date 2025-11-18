# Infra Metrics Exporter

This project is a small Node.js metrics exporter that I containerized with Docker and deployed to AWS ECS Fargate using Terraform.  
The goal of the project is to demonstrate end-to-end infrastructure skills, including containerization, AWS deployment, IaC, and basic observability.  

The repository also includes an optional local Prometheus + Grafana setup for testing and visualizing metrics before deploying to AWS.

---

## Project Overview

The project includes:

- A lightweight Node.js service exposing:
  - `/health` – basic health check
  - `/metrics` – Prometheus-formatted metrics
  - `/whoami` – container/environment details
  - `/logs/demo` – demo endpoint that increments a counter and writes structured logs
- A Dockerfile for containerizing the app
- A Terraform configuration that deploys:
  - A VPC with public subnets
  - Security groups
  - An ECS cluster
  - A Fargate task and service
  - CloudWatch log integration
  - IAM task/execution roles
- A local monitoring setup using Prometheus and Grafana (optional)

This is intended as a portfolio project that mirrors common real-world DevOps patterns.

---

## Architecture Summary

### Local (Optional)
Exporter → Prometheus → Grafana

### AWS Deployment
Docker Image → ECR → ECS Task Definition → Fargate Service → CloudWatch Logs  
(Everything except ALB; ALB is included in Terraform but disabled due to AWS account limitations.)

---

## Directory Structure

infra/ # Terraform (networking, ECS, IAM, logging)
monitoring/ # Prometheus configuration
src/ # Node.js exporter source code

Dockerfile
.dockerignore
package.json
README.md


---

## Running the Exporter Locally

Build and run the Docker image:

docker build -t infra-metrics-exporter:local .
docker run --rm -p 3000:3000 infra-metrics-exporter:local


Visit:

- http://localhost:3000/health  
- http://localhost:3000/metrics

---

## Local Prometheus + Grafana Setup (Optional)

Run Prometheus:

docker run -d --name prometheus -p 9090:9090 ^
-v %cd%/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml ^
prom/prometheus


Run Grafana:

docker run -d --name grafana -p 3001:3000 grafana/grafana


Add Prometheus as a data source in Grafana:

URL: http://host.docker.internal:9090


Then create dashboards or explore metrics like:
- `http_requests_total`
- `demo_log_calls_total`
- other default Node.js metrics

---

## Deploying to AWS (Terraform + Fargate)

### 1. Push the Docker image to ECR

Authenticate:

aws ecr get-login-password --region us-east-1 |
docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com


Build, tag, and push the image:

docker build -t infra-metrics-exporter .
docker tag infra-metrics-exporter:latest <ECR_URL>:v1
docker push <ECR_URL>:v1


### 2. Deploy the infrastructure

cd infra
terraform init
terraform apply


Terraform will:

- Create the VPC + networking
- Create an ECS cluster
- Deploy the task and service
- Configure CloudWatch logs
- Output the public IP of the running container

Visit:

http://<public-ip>:3000/health


---

## Stopping or Destroying Resources

To stop the running Fargate task:

terraform apply -var="desired_count=0"


To remove everything and avoid charges:

terraform destroy

---

## Notes

- ALB support is included in the Terraform configuration but commented out due to AWS account restrictions when testing.
- This project is intentionally simple, focusing on the core skills rather than building a complex application. My main focus is Infrastructure.

---

## License
MIT


