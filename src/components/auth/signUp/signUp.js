import React,{useState} from 'react'
import {createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../firebase';

function SignUp() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState()
    const signIn = (e)=>{
        e.preventDefault()
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up 
          const user = userCredential.user;
          // ...
          console.log(user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
          console.error(errorCode,errorMessage)
        });
    }
  return (
    <div className='signin-form'>
        <form onSubmit={(e)=>signIn(e)}>
            <input type='text' placeholder='Email' onChange={e=>setEmail(e.target.value)} required></input>
            <input type='password' placeholder='Mot de passe' onChange={e=>setPassword(e.target.value)} required></input>
            <button type='sumbit'> Connecter</button>    

        </form>
    </div> 
 )
}

export default SignUp