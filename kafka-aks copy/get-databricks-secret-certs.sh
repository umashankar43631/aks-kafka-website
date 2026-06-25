# Cluster CA cert (so Databricks trusts the brokers' TLS)
kubectl get secret my-cluster-cluster-ca-cert -n kafka \
  -o jsonpath='{.data.ca\.crt}' | base64 -d > ca.crt

# SCRAM password for databricks-user
kubectl get secret databricks-user -n kafka \
  -o jsonpath='{.data.password}' | base64 -d > db-password.txt
