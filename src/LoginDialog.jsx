import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";

export default function LoginDialog() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailSignIn = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
    if (error) console.error("Error signing in:", error)
    if (data.user) {
      window.location.reload()

    }

  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) console.error("Error signing up:", error)
    window.location.reload()
  }

  const handleOAuthSignIn = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error(`Error signing in with ${provider}:`, error)
  }

  return (
    <Dialog>
      <div >
        <span className="font-medium text-sm text-gray-600">Login to save your chat history</span>
      </div>

      <DialogTrigger asChild>

        <Button variant="outline" className="mt-5">Sign In / Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Sign Up" : "Sign In"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <div className="flex flex-col space-y-2 mt-4">
          <Button onClick={() => handleOAuthSignIn("google")} variant="outline">
            <FcGoogle />
            Sign in with Google
          </Button>
          <Button onClick={() => handleOAuthSignIn("facebook")} variant="outline">
            <BsFacebook />
            Sign in with Facebook
          </Button>
        </div>
        <div className="text-center mt-4">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

