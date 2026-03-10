variable "project_id" {
  description = "Google Cloud project ID."
  type        = string
}

variable "region" {
  description = "Primary region for Cloud Run and supporting services."
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment identifier (e.g., staging, production)."
  type        = string
  default     = "staging"
}

variable "service_name" {
  description = "Base name used for resources such as the Cloud Run service."
  type        = string
  default     = "quorvium-api"
}

variable "cloud_run_image" {
  description = "Bootstrap container image used when Terraform creates the Cloud Run service for the first time."
  type        = string
}

variable "cloud_run_max_instances" {
  description = "Maximum number of Cloud Run instances to autoscale."
  type        = number
  default     = 5
}

variable "cloud_run_cpu" {
  description = "Requested CPU allocation for Cloud Run container."
  type        = string
  default     = "1"
}

variable "cloud_run_memory" {
  description = "Requested memory allocation for Cloud Run container."
  type        = string
  default     = "512Mi"
}

variable "oauth_client_secret_secret_id" {
  description = "Secret ID for the Google OAuth client secret in Secret Manager."
  type        = string
  default     = "google-oauth-client-secret"
}

variable "google_client_id" {
  description = "Deprecated: runtime value is now set by the GitHub Actions deploy workflow."
  type        = string
  default     = ""
}

variable "google_redirect_uri" {
  description = "Deprecated: runtime value is now set by the GitHub Actions deploy workflow."
  type        = string
  default     = ""
}

variable "client_origin" {
  description = "Deprecated: runtime value is now set by the GitHub Actions deploy workflow."
  type        = string
  default     = ""
}
