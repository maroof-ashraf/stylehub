import { db } from "./firebase-config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const adminUid = "mJrjXJbt2DfLzzKZt1clJYh12M92";

set(ref(db, 'admins/' + adminUid), true)
    .then(() => {
        console.log("Admin UID " + adminUid + " has been added to the database.");
        alert("Admin UID added successfully! You can now delete this script or its reference.");
    })
    .catch((error) => {
        console.error("Error adding admin:", error);
        alert("Error adding admin: " + error.message);
    });
