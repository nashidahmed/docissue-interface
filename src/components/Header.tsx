import { ORIGIN, signInWithGoogle } from "@/utils/lit"
import useAccounts from "@/hooks/useAccounts"
import useAuthenticate from "@/hooks/useAuthenticate"
import useSession from "@/hooks/useSession"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDisconnect } from "wagmi"
import Image from "next/image"
import { disconnectWeb3 } from "@lit-protocol/lit-node-client"
import { LOCAL_STORAGE_KEYS } from "@lit-protocol/constants"

export default function Header() {
  const redirectUri = ORIGIN + "/"
  const { disconnectAsync } = useDisconnect()

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri)
  const {
    fetchAccount,
    account,
    setAccount,
    loading: accountLoading,
    error: accountError,
  } = useAccounts()
  const {
    initSession,
    sessionSigs,
    setSessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession()
  const router = useRouter()

  const error = authError || accountError || sessionError

  useEffect(() => {
    // If user is authenticated, fetch accounts
    if (authMethod) {
      router.replace(window.location.pathname, undefined)
      fetchAccount(authMethod)
    }
  }, [authMethod, fetchAccount])

  useEffect(() => {
    // If user is authenticated and has selected an account, initialize session
    if (authMethod && account) {
      console.log(authMethod, account)
      initSession(authMethod, account)
    }
  }, [authMethod, account, initSession])

  async function handleGoogleLogin() {
    await signInWithGoogle(redirectUri)
  }

  async function handleLogout() {
    disconnectWeb3()
    setAccount(undefined)
    setSessionSigs(undefined)
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_KEY)
  }

  function ButtonText() {
    if (authLoading || accountLoading || sessionLoading) {
      console.log(authLoading, accountLoading, sessionLoading)
      return (
        <div>
          <div className="loader w-6 h-6"></div>
        </div>
      )
    } else if (account && sessionSigs) {
      console.log(account, sessionSigs)
      return <span>Sign out</span>
    } else {
      return <span>Sign in with Google</span>
    }
  }

  return (
    <header className="flex justify-between items-center py-12">
      <Link href={"/"} className="font-mono text-2xl">
        Docissue
      </Link>
      <div className="flex items-center gap-6 font-mono">
        <Link href={"/view"}>View Content</Link>
        <Link href={"/upload"}>Upload Content</Link>
        <Link href={"/issuer/create"}>Become an issuer</Link>
        <button
          type="button"
          className={`flex gap-2 items-center bg-white hover:${
            authLoading || accountLoading || sessionLoading
              ? "cursor-not-allowed opacity-50"
              : "bg-gray-100"
          } text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow`}
          disabled={authLoading || accountLoading || sessionLoading}
          onClick={account && sessionSigs ? handleLogout : handleGoogleLogin}
        >
          <div className="btn__icon">
            <Image
              src="/icons/google.png"
              alt="Google logo"
              fill={true}
            ></Image>
          </div>
          <ButtonText />
        </button>
        {/* <w3m-button /> */}
      </div>
    </header>
  )
}
