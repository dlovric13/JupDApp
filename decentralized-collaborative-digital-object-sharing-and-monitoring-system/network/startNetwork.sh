#!/bin/bash

export PATH=${PWD}/../fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../fabric-samples/test-network/configtx
# export FABRIC_CFG_PATH=${PWD}/../fabric-samples/config/
# export CORE_PEER_MSPCONFIGPATH=${PWD}/../fabric-samples/config/

# echo "FABRIC_CFG_PATH is set to: $FABRIC_CFG_PATH"

start=`date +%s.%N`

function _exit(){
    printf "Exiting:%s\n" "$1"
    exit -1
}

set -ev
set -o pipefail

# clean out any old identites in the wallets
rm -rf ../backend/wallet/*

pushd ../fabric-samples/test-network/
./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn digitalobject -ccv 1 -ccl javascript -ccp ../../chaincode/ -ccep "OR('Org1MSP.peer','Org2MSP.peer')"
# ./network.sh deployCC -ccn digitalobject -ccv 1 -ccl javascript -ccp ../../chaincode/
popd 

end=`date +%s.%N`
runtime=$(echo "$end - $start" | bc -l)
echo "Execution time of script: $runtime seconds."