import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { create_user } from "./database";
import { app, auth } from "./firebase";

console.log("Firebase initialized", app);
export { app };
export function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        create_user(user.uid, user.displayName).then(() => {
            window.location.reload();
        });
    }).catch((error) => {
        console.error(error);
    });
}