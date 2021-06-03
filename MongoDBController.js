const {MongoClient} = require('mongodb');
const URI = "mongodb://root:example@localhost:27017/?retryWrites=true&w=majority&useUnifiedTopology=true";


export default async function getRegister(newValue){   
    const client = new MongoClient(URI);
    var result ;

    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        result = await client.db("PersonalInformation").collection("Users").findOne({'mail':newValue});
         
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}