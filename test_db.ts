import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCOKhOFjhzEzTxirYIaggLU6YTulbP_CpI",
    authDomain: "deyrot-e4381.firebaseapp.com",
    projectId: "deyrot-e4381",
    storageBucket: "deyrot-e4381.firebasestorage.app",
    messagingSenderId: "421061329011",
    appId: "1:421061329011:web:691ea3d833a6dc5ff46a06"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snapshot = await getDocs(collection(db, 'denuncias'));
    snapshot.forEach(doc => console.log(doc.data().pdfUrl));
    process.exit(0);
}
run();
