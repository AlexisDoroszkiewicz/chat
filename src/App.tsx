import {
	GoogleAuthProvider,
	getAuth,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import {
	getFirestore,
	query,
	getDocs,
	collection,
	where,
	addDoc,
	Firestore,
	orderBy,
	limit,
	serverTimestamp,
} from "firebase/firestore";
import { firebaseapp } from "../firebase";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import firebase from "firebase/app";
import { useState } from "react";

const auth = getAuth(firebaseapp);
const firestore = getFirestore(firebaseapp);

function App() {
	const [user] = useAuthState(auth);

	return (
		<div>
			{user ? "Hello" : <SignIn />}
			<Signout />
			<ChatRoom />
		</div>
	);
}

export default App;

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	};

	return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function Signout() {
	return (
		auth.currentUser && (
			<button onClick={(e) => signOut(auth)}>Sign Out</button>
		)
	);
}

const messagesRef = collection(firestore, "messages");
const q = query(messagesRef, orderBy("createdAt"), limit(25));

function ChatRoom() {
	const [messages] = useCollectionData(q);
	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e: any) => {
		e.preventDefault();
		const { uid } = auth?.currentUser || { uid: null };
		await addDoc(collection(firestore, "messages"), {
			text: formValue,
			uid,
			createdAt: serverTimestamp(),
		});

		setFormValue("");
	};

	return (
		<>
			<div>
				{messages &&
					messages.map((msg, i) => (
						<ChatMessage key={i} message={msg} />
					))}
			</div>
			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
				/>
				<button type="submit">send message</button>
			</form>
		</>
	);
}

function ChatMessage(props: any) {
	const { text, uid } = props.message;
	const messageClass = uid === auth?.currentUser?.uid ? "sent" : "received";

	return (
		<>
			<p className={messageClass}>{text}</p>
		</>
	);
}
