
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = `mongodb+srv://${process.env.MONGODB}@main.f0erii0.mongodb.net/?appName=Main`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
await client.connect();
const db = await client.db("wikilinks");


function get_date_string(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function create_user(uid, display_name, email) {
    try {
            const users = db.collection("users");
            await users.insertOne({
                uid: uid,
                displayName: display_name,
                email: email
            });

    } catch (e) {
        console.error(e);
    }
}

async function get_user(uid) {
    try {
        let user = null;
        const users = db.collection("users");
        user = await users.findOne({ uid: uid });
        return user;
    } catch (e) {
        console.error(e);
    }
}

async function update_user(uid, display_name, email) {
    try {
        const users = db.collection("users");
        await users.updateOne({ uid: uid }, { $set: { displayName: display_name, email: email } });
        
    } catch (e) {
        console.error(e);
    }
}

async function submit_daily_result(uid, score) {
    try {
            const reports = db.collection("daily_results");
            await reports.insertOne({
                uid: uid,
                score: score,
                date: get_date_string(new Date()),
                submittedAt: new Date(),
            });
    } catch (e) {
        console.error(e);
    }
}

async function get_daily_report(uid, date) {
    try {
        const reports = db.collection("daily_results");
        let report = await reports.findOne({ uid: uid,
            date: get_date_string(date)
        });
        return report;
    } catch (e) {
        console.error(e);
    }
}

async function get_all_reports_by_user(uid) {
    try {
        let reports = [];
        const reportsCollection = db.collection("daily_results");
        reports = await reportsCollection.find({ uid: uid }).toArray();
        return reports;
    } catch (e) {
        console.error(e);
    }
}

async function get_all_reports_by_date(date) {
    try {
        let reports = [];
        const reportsCollection = db.collection("daily_results");
        reports = await reportsCollection.find({
            date: get_date_string(date)        
        }).toArray();
        return reports;
    } catch (e) {
        console.error(e);
    }
}

//Add () to test the functions
(async () => {
    //await create_user("test_uid", "Test User", "test@gmail.com");
    await submit_daily_result("test_uid", 5);
})

export { create_user, get_user, update_user, submit_daily_result, get_daily_report, get_all_reports_by_user, get_all_reports_by_date };
