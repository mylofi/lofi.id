import { createContext } from "react";
import { Session } from "@supabase/supabase-js";

export const ServerAuthSessionContext = createContext<Session | null>(null);
