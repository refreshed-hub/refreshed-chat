import './App.css';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React from 'react';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
})

const auth = firebase.auth();
const firestore = firebase.firestore();



function Login(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Login using Google</button>
  )
}

function Logout() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Logout</button>
  )
}

function Chatroom() {
  const dummy = React.useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(30);

  const [messages] = useCollectionData(query, {idfield: 'id'});

  const [formValue, setFormValue] = React.useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth'});
  }
  return (
    <React.Fragment>
      <main>

        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">Send</button>

      </form>
    </React.Fragment>
  )

  function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    return <div className={'message ${messageClass'}>
      <img src={photoURL} />
      <p>{text}</p>
      </div>
  }
}

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
      <Login></Login>
      <Logout></Logout>
      <Chatroom></Chatroom>
      </header>
    </div>
  );
}

export default App;
