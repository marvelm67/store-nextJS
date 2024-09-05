import bcrypt from 'bcrypt'
import {
  getFirestore,
  getDocs,
  collection,
  getDoc,
  doc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import app from "./init";

const firestore = getFirestore(app);

// Fungsi untuk mengambil semua data dari sebuah koleksi
export async function retrieveCollectionData(collectionName: string) {
  const snapshot = await getDocs(collection(firestore, collectionName));
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return data;
}

// Fungsi untuk mengambil data berdasarkan ID dokumen dari sebuah koleksi
export async function retrieveDocumentData(collectionName: string, id: string) {
  const snapshot = await getDoc(doc(firestore, collectionName, id));
  const data = snapshot.data();
  return data;   
}

// Fungsi untuk mendaftarkan pengguna baru
export async function signUp(userData: {
  email: string;
  fullname:string;
  phone: string;
  password: string;
  role?:string;
  }
  , callback: Function) {
  const q = query(
    collection(firestore, "users"),
    where("email", "==", userData.email)
  );

  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (data.length > 0) {
    callback({status: false});
  } else {
    if(!userData.role){
      userData.role = 'member';
    }
    userData.password = await bcrypt.hash(userData.password, 10); 
    await addDoc(collection(firestore, "users"), userData)
      .then(() => {
        callback(true);
      })
      .catch((error) => {
        callback(false);
        console.log(error);
      });
  }
}
