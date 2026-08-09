import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "../../firebase/config";
import {
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
export const GithubLoginComponent = () => {
  // setup login, popup, logout
  const [error, setError] = useState();
  // pending
  const [pending, setIsPending] = useState(false);
  // data (user credential)
  const [user, setUser] = useState(null);
  // create provider
  const provider = new GithubAuthProvider();
  provider.addScope("user:email");
  // navigation
  const navigate = useNavigate();
  // useEffect tracking on user credential
  useEffect(() => {
    const unsubscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscriber();
  }, []);
  // setup login with github
  const loginWithgithub = async () => {
    setIsPending(true);
    try {
      const res = await signInWithPopup(auth, provider);
      if (!res) {
        throw new Error("login unsuccessfully");
      }
      const user = res.user;
      console.log("github Info: ", user);
      setIsPending(false);
    } catch (error) {
      setError(error);
      console.log(error.message);
      setIsPending(false);
    }
  };
  //logout features
  const githubLogout = async () => {
    setIsPending(false);
    setError(null);
    try {
      await signOut(auth);
      setIsPending(true);
      console.log("Logout successfully!");
    } catch (error) {
      setError(error);
      console.log(error.message);
      setIsPending(false);
    }
  };
  return (
    <>
      <button
        className="w-full mt-4 border border-gray-300 py-2 rounded-lg flex
items-center justify-center hover:bg-gray-100 transition disabled:opacity-60"
        onClick={loginWithgithub}
        disabled={pending}
      >
        <img
          src="https://www.svgrepo.com/show/394174/github.svg"
          alt="github"
          className="w-5 h-5 mr-2"
        />
        {pending ? "Registering…" : "Register with Github"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error.message}</p>
      )}
    </>
  );
};