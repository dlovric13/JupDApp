start=`date +%s.%N`
function _exit(){
    printf "Exiting:%s\n" "$1"
    exit -1
}

set -ev
set -o pipefail


../fabric-samples/test-network/network.sh down
../fabric-samples/test-network/network.sh up createChannel -ca -s couchdb
../fabric-samples/test-network/network.sh deployCC -ccn digitalobject -ccv 1 -ccl javascript -ccp ../../chaincode
end=`date +%s.%N`

runtime=$( echo "Execution time of script: $end - $start" | bc -l )
