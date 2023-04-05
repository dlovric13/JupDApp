#enroll org1 admin
node enrollAdmin org1

#enroll org2 admin
node enrollAdmin org2

#setup 3 users
count=3
for i in $(seq $count); do
    node registerEnrollUser org1 user$i
done


count=3
for i in $(seq $count); do
    node registerEnrollUser org2 user$i
done