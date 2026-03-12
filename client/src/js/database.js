
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    addDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "./firebase";


function get_date_string(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function create_user(uid, display_name) {
    try {
        await setDoc(doc(db, "users", uid), {
            displayName: display_name,
        });
    } catch (e) {
        console.error(e);
    }
}

async function get_user(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (e) {
        console.error(e);
    }
}

async function update_user(uid, display_name) {
    try {
        await updateDoc(doc(db, "users", uid), {
            displayName: display_name,
        });
    } catch (e) {
        console.error(e);
    }
}

async function submit_daily_result(uid, score) {
    try {
        await addDoc(collection(db, "daily_results"), {
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
        const q = query(
            collection(db, "daily_results"),
            where("uid", "==", uid),
            where("date", "==", get_date_string(date))
        );
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : snapshot.docs[0].data();
    } catch (e) {
        console.error(e);
    }
}

async function get_all_reports_by_user(uid) {
    try {
        const q = query(
            collection(db, "daily_results"),
            where("uid", "==", uid)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data());
    } catch (e) {
        console.error(e);
    }
}

async function get_all_reports_by_date(date) {
    try {
        const q = query(
            collection(db, "daily_results"),
            where("date", "==", get_date_string(date))
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data());
    } catch (e) {
        console.error(e);
    }
}

export { create_user, get_user, update_user, submit_daily_result, get_daily_report, get_all_reports_by_user, get_all_reports_by_date };
