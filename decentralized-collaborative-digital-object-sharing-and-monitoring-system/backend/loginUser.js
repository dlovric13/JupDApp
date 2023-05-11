
const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const {
  buildCCPOrg1,
  buildCCPOrg2,
  buildWallet,
} = require("./util/AppUtil.js");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { adminId } = require("./util/config");
const { JWT_SECRET } = require("./util/config");

async function loginUser(username, password) {
  const walletPathOrg1 = path.join(__dirname, "wallet/org1");
  const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

  const walletPathOrg2 = path.join(__dirname, "wallet/org2");
  const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);

  const wallets = [walletOrg1, walletOrg2];
  const ccp = [buildCCPOrg1(), buildCCPOrg2()];

  for (let i = 0; i < wallets.length; i++) {
    console.log(`Checking wallet ${i}`);

    try {
      const user = await wallets[i].get(username);
      console.log(
        "List of the identities in the wallet:" + JSON.stringify(user)
      );
      if (user) {
        console.log(`User found in wallet ${i}`);
        const gateway = new Gateway();

        try {
          await gateway.connect(ccp[i], {
            wallet: wallets[i],
            identity: adminId,
            discovery: { enabled: true, asLocalhost: true },
          });

          const network = await gateway.getNetwork("mychannel");
          const contract = network.getContract("digitalobject");
         
          const userDetails = JSON.parse(
            await contract.evaluateTransaction(
              "RegisterContract:loginUser",
              username
            )
          );
          console.log("User details",userDetails);
          const hashedPassword = userDetails.password;


          const isPasswordValid = await argon2.verify(hashedPassword, password);

          if (isPasswordValid) {
            
            const userType = userDetails.userType;
            const affiliation = userDetails.affiliation;
            const userID = userDetails.userID;
            console.log("User id:",userID);
            const token = jwt.sign(
              { username, affiliation, userType, userID },
              JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            console.log("Token from backend:", token);
            return token;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error) {
          console.error(`Failed to login user ${username}: ${error}`);
        } finally {
          gateway.disconnect();
        }
      }
    } catch (error) {
      console.log(`User not found in wallet ${i}`);
    }
  }

  throw new Error(`User with username ${username} not found`);
}

module.exports = { loginUser };
