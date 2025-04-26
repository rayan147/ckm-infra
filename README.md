# CKM Infrastructure

![Infrastructure Status](https://img.shields.io/github/workflow/status/rayan147/ckm-infra/Terraform?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/rayan147/ckm-infra?style=flat-square)
![License](https://img.shields.io/github/license/rayan147/ckm-infra?style=flat-square)

A modern Infrastructure as Code (IaC) repository for managing cloud resources and Kubernetes deployments for the CKM platform.

## 🚀 Overview

This repository contains the infrastructure configuration for the CKM platform using a GitOps approach. We leverage AWS CDK for cloud infrastructure provisioning and ArgoCD with Kustomize for Kubernetes application deployments.

## 📋 Features

- **Infrastructure as Code (IaC)**: All infrastructure defined and managed through TypeScript CDK code
- **Multi-environment Support**: Configurations for development and production environments
- **GitOps Workflow**: ArgoCD-driven deployments with automatic synchronization
- **Kubernetes Operators**: Ready-to-use operators for common services (PostgreSQL, MinIO, etc.)
- **AWS Integration**: Native integration with AWS services and secrets management
- **Kustomize Overlays**: Environment-specific customizations with a DRY approach

## 📁 Repository Structure

```
.
├── argocd/                   # ArgoCD configuration
│   ├── application.yaml      # Main ArgoCD application definition
│   ├── applications/         # Application-specific configurations
│   └── projects/             # ArgoCD project definitions
├── base/                     # Base Kubernetes resources
│   ├── deployment.yaml       # Base deployment configuration
│   ├── kustomization.yaml    # Kustomize base configuration
│   └── service.yaml          # Base service configuration
├── infrastructure/           # AWS CDK infrastructure code
│   ├── bin/                  # CDK entry points
│   ├── lib/                  # CDK constructs and stacks
│   ├── src/                  # Source code
│   ├── test/                 # Tests for infrastructure
│   ├── cdk.json              # CDK configuration
│   └── package.json          # Node.js dependencies
├── operators/                # Kubernetes operators
│   ├── api/                  # API operator
│   ├── aws-secrets-provider/ # AWS Secrets provider
│   ├── homepage/             # Homepage operator
│   ├── minio/                # MinIO operator
│   ├── postgres-operator/    # PostgreSQL operator
│   └── tailscale/            # Tailscale operator
└── overlays/                 # Environment-specific overlays
    ├── dev/                  # Development environment
    └── prod/                 # Production environment
```

## 🛠️ Prerequisites

- [AWS CDK](https://aws.amazon.com/cdk/) (latest version)
- [Node.js](https://nodejs.org/) (v16+)
- [pnpm](https://pnpm.io/) (for package management)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (latest stable)
- [AWS CLI](https://aws.amazon.com/cli/)
- [kustomize](https://kustomize.io/) (latest stable)
- [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/) (optional)

## 🚦 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/rayan147/ckm-infra.git
   cd ckm-infra
   ```

2. **Configure AWS credentials**

   ```bash
   aws configure
   ```

3. **Install dependencies for infrastructure**

   ```bash
   cd infrastructure
   pnpm install
   ```

4. **Deploy infrastructure with CDK**

   ```bash
   pnpm cdk synth
   pnpm cdk deploy
   ```

5. **Access your Kubernetes cluster**

   ```bash
   # Configure kubectl with cluster access
   aws eks update-kubeconfig --name ckm-dev-cluster --region us-west-2
   
   # Verify connection
   kubectl get nodes
   ```

6. **Deploy applications with ArgoCD**

   ```bash
   # Apply the ArgoCD configuration
   kubectl apply -f argocd/application.yaml
   
   # Monitor deployment status
   kubectl get applications -n argocd
   ```

## 🔄 Workflow

1. **Infrastructure Development**
   - Create a new branch for your infrastructure changes
   - Implement your CDK modifications
   - Test locally using `cdk diff` and `cdk synth`
   - For complex changes, use `cdk deploy --hotswap` for faster testing

2. **Kubernetes Application Development**
   - Modify base resources or create new ones as needed
   - Test changes with kustomize: `kustomize build overlays/dev`
   - For local testing, use `kubectl apply -k overlays/dev`

3. **Code Review**
   - Open a Pull Request against the main branch
   - Automated checks will validate your changes
   - Peer review by team members

4. **Deployment**
   - Merged changes trigger the CI/CD pipeline
   - For infrastructure: CDK changes are deployed to AWS
   - For applications: ArgoCD automatically detects and applies changes
   - Production deployments require manual approval

## 🔒 Security

- Secrets are managed using AWS Secrets Manager via the aws-secrets-provider
- Infrastructure follows AWS's principle of least privilege
- Production environment is isolated with restricted access
- Security scans are performed on container images and code
- Tailscale provides secure network access to cluster resources

## 📊 Management & Monitoring

- ArgoCD provides a dashboard for application deployment status
- AWS CloudWatch for infrastructure monitoring and logs
- Homepage operator provides a central dashboard for services
- MinIO offers S3-compatible object storage
- PostgreSQL operator manages database instances and backups

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

Detailed documentation is available in the [docs](./docs) directory, including:

- Architecture diagrams
- Setup guides
- Troubleshooting tips
- Best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Kubernetes](https://kubernetes.io/) for container orchestration
- The amazing open-source community
