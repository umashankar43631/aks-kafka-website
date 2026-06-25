# 1. Variables (edit these)
RG=rg-kafka-lab
LOCATION=centralindia          # closest Azure region to you
CLUSTER=aks-kafka-lab
K8S_VERSION=1.34.5                # Strimzi 0.51 needs >= 1.34.5

# 2. Resource group
# az group create --name $RG --location $LOCATION

# 3. AKS cluster
az aks create \
  --resource-group $RG \
  --name $CLUSTER \
  --location $LOCATION \
  --kubernetes-version $K8S_VERSION \
  --node-count 3 \
  --node-vm-size Standard_D4s_v5 \
  --node-osdisk-size 64 \
  --network-plugin azure \
  --generate-ssh-keys \
  --tier free

# 4. Wire kubectl to the new cluster
az aks get-credentials --resource-group $RG --name $CLUSTER

# 5. Verify
kubectl get nodes
