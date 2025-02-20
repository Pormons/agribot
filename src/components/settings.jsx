import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import useLanguageStore from "../store/LanguageStore";
import LoginDialog from "../LoginDialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsDialog() {
    const signedIn = useAuthStore(state => state.signed_in);
    const setSignedIn = useAuthStore(state => state.setSignedIn);
    const language = useLanguageStore(state => state.language);
    const setLanguage = useLanguageStore(state => state.setLanguage);
    const setGen = useLanguageStore(state => state.setGen);
    const gen = useLanguageStore(state => state.gen);

    const handleLanguageSelect = (value) => {
        setLanguage(value)
    }

    const handleSwitch = (toggle) => {
        setGen(toggle)
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            console.log('logout')
            setSignedIn(false);
            window.location.reload()
        } catch (error) {
            console.log(error);
        }

    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button>
                    <Settings />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="flex justify-center flex-col items-center">
                    {
                        signedIn ?
                            <Button onClick={() => handleLogout()} className="bg-zinc-700 text-white">
                                <span>
                                    Logout
                                </span>
                            </Button> : <LoginDialog />
                    }

                    <Separator className="my-5 w-full bg-zinc-600" />
                    <div className="mb-2">
                        <span className="font-medium text-sm text-gray-600">Select Preferred Language</span>
                    </div>

                    <Select className=" focus:outline-none mt-2" value={language} onValueChange={handleLanguageSelect}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Bisaya (Cebuano)">Bisaya</SelectItem>
                            <SelectItem value="Tagalog">Tagalog</SelectItem>
                        </SelectContent>
                    </Select>
                    <Separator className="my-5 w-full bg-zinc-600" />
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={gen} // Bind to state
                            onCheckedChange={handleSwitch} // Handle the change event
                            id="airplane-mode" className={`${gen ? "bg-green-700" : "bg-zinc-500"} ring-offset-2 ring-indigo-300`} />
                        <Label htmlFor="airplane-mode" className="text-zinc-600">Mang Juan</Label>
                    </div>


                </div>


            </DialogContent>
        </Dialog>
    )
}

