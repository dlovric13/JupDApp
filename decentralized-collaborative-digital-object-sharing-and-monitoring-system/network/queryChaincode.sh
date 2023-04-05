#!/bin/bash

# Set the environment variables for your project
export FABRIC_CFG_PATH=${PWD}/../fabric-samples/config
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051


# Query the chaincode
peer chaincode query -C mychannel -n digitalobject -c '{"Args":["NotebookContract:getNotebook", "Untitled8.ipynb"]}'
