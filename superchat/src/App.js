// here is the frontend code
import React, { useRef, useState } from 'react';
import './App.css';

// here import the firebase sdk (software dev kit)
// An SDK provides a complete development kit for software development for building applications for a specified platform, service, or language. An API is used to facilitate communication between two platforms.
//import firebase from 'firebase/app';
//import 'firebase/firestore'; //database here
//import 'firebase/auth'; //user authentication here

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// here we import some hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//initialize here to identify the app
firebase.initializeApp({
  apiKey: "AIzaSyBcojcwyE_CSzQeBmh5I3PIP38faCPUTm8",
  authDomain: "chatapp-890ec.firebaseapp.com",
  projectId: "chatapp-890ec",
  storageBucket: "chatapp-890ec.appspot.com",
  messagingSenderId: "392864076123",
  appId: "1:392864076123:web:733430c3742994a34d8a7e"
})

// make reference to the auth and firestore sdks as global variables
const auth = firebase.auth();
const firestore = firebase.firestore();

// if logged in, user is an object, of out then user is null


function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {/* this line says if user exists as an object(i.e. logged in), show chatroom, otherwise show sign-in */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    //on click will create a pop-up and ask you to sign in with the provider (i.e. google here)
    auth.signInWithPopup(provider);
  }

  return(
    // note that on clicking this button will run the sign-in-with-google function
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  // check to see if we have a current user
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  // deals with cannot-autoscroll when sending a new message problem
  const dummy = useRef();

  //reference messages to a firestore collection
  const messagesRef = firestore.collection('messages');

  // create a query for messages and order them by timestamp created, with a limit of 25 max
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  //this is your input, put empty string first
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    // preventing refreshing the page
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    // creates new document in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    // deals with cannot-autoscroll when sending a new message problem
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}></ChatMessage>)}

        {/* this div deals with cannot-autoscroll when sending a new message problem */}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something..."></input>
        <button type="submit" disabled={!formValue}>submit</button>
      </form>
    </>
  )
}

// this function deals with the chat message
function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  // conditional css here, if uid is equal to currentuser's uid, we know that the user sent the message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || ''} />
        <p>{text}</p>
      </div>
    </>
    )
}

export default App;