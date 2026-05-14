# Deployments

Production manifests land here (k8s, ECS, Fly, etc.) as soon as we pick a
target. Today the only production-ready artifact is the compose overlay:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build
```

## Planned layout

```
deployments/
├── k8s/                   # Helm chart or kustomize overlays
├── github-actions/        # build + push + deploy workflows
├── terraform/             # cloud infra (VPC, RDS, ElastiCache, S3)
└── runbooks/              # ops procedures (incident, recrawl, recovery)
```
