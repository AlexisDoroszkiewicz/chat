import {
	GoogleAuthProvider,
	getAuth,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import {
	getFirestore,
	query,
	collection,
	addDoc,
	orderBy,
	serverTimestamp,
} from "firebase/firestore";
import { firebaseapp } from "../firebase";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import SendIcon from "@mui/icons-material/Send";
import Linkify from "react-linkify";

const auth = getAuth(firebaseapp);
const firestore = getFirestore(firebaseapp);

function App() {
	const [user] = useAuthState(auth);

	return (
		<div
			css={css`
				max-width: 400px;
				margin-left: auto;
				margin-right: auto;
				margin-top: 1em;
				& > button {
					padding: 0.5em 1em;
					width: 100%;
				}
			`}>
			{user ? <Signout /> : <SignIn />}
			{user && <ChatRoom />}
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
const q = query(messagesRef, orderBy("createdAt"));

function ChatRoom() {
	const [messages] = useCollectionData(q);
	const [formValue, setFormValue] = useState("");
	const [user] = useAuthState(auth);

	const sendMessage = async (e: any) => {
		e.preventDefault();
		if (formValue == "") return;
		const { uid } = auth?.currentUser || { uid: null };
		await addDoc(collection(firestore, "messages"), {
			text: formValue,
			uid,
			createdAt: serverTimestamp(),
			photo: user?.photoURL,
		});

		setFormValue("");
	};

	const dummy = useRef<HTMLDivElement>(null);

	useEffect(() => {
		dummy.current?.scrollIntoView();
	});

	return (
		<>
			<div
				css={css`
					max-height: min(90vh, 600px);
					overflow: auto;
					padding-left: 1em;
					padding-right: 1em;
				`}>
				{messages &&
					messages.map((msg, i) => (
						<ChatMessage key={i} message={msg} />
					))}
				<div ref={dummy}></div>
			</div>
			<form
				onSubmit={sendMessage}
				css={css`
					display: flex;
					height: 2em;
					border: 1px solid black;
					border-radius: 2px;
					input {
						width: 100%;
					}
					button {
						aspect-ratio: 1 / 1;
					}
					input,
					button {
						border: none;
					}
				`}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
				/>
				<button
					type="submit"
					css={css`
						display: grid;
						place-items: center;
						background-color: transparent;
						margin-left: 0.5em;
						margin-right: 0.5em;
					`}>
					<SendIcon
						css={css`
							fill: #0096ff;
						`}
					/>
				</button>
			</form>
		</>
	);
}

function ChatMessage(props: any) {
	const { text, uid, photo } = props.message;
	const messageClass = uid === auth?.currentUser?.uid ? "sent" : "received";

	return (
		<div
			className={messageClass}
			css={css`
				display: flex;
				align-items: center;
				gap: 0.5em;
				width: fit-content;

				img {
					width: 34px;
					height: 34px;
					border-radius: 50%;
				}
				p {
					padding: 0.5em 1em;
					border-radius: 20px;
					max-width: 70%;
					word-break: break-word;
				}
				&.sent {
					margin-left: auto;
					justify-content: flex-end;
				}
				&.received {
					justify-content: flex-start;
				}
				&.sent img {
					order: 1;
				}
				&.sent p {
					background-color: #0096ff;
					color: white;
				}
				&.received p {
					background-color: lightgrey;
					color: black;
				}
			`}>
			<img src={photo} referrerPolicy="no-referrer" />
			<p>
				<Linkify
					componentDecorator={(decoratedHref, decoratedText, key) => (
						<a target="blank" href={decoratedHref} key={key}>
							{decoratedText}
						</a>
					)}>
					{text}
				</Linkify>
			</p>
		</div>
	);
}
