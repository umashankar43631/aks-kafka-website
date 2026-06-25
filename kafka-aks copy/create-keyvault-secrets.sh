# Password
az keyvault secret set \
  --vault-name fordatabrickskv1 \
  --name kafka-scram-password \
  --value "$(cat db-password.txt)"

# CA cert (multi-line, so pass via file)
az keyvault secret set \
  --vault-name fordatabrickskv1 \
  --name kafka-ca-cert \
  --file ca.crt
