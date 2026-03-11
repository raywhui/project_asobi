import { createContext, ReactNode, useState } from "react";

/**
 * Currently unused. Lives in codebase incase i need a use context for anything.
 */
export const PlayerNotesContext = createContext<{
  text: string;
  setText: (value: string) => void;
} | null>(null);

export const PlayerNotesProvider = ({ children }: { children: ReactNode }) => {
  const [text, setText] = useState("test");
  return (
    <PlayerNotesContext.Provider value={{ text, setText }}>
      {children}
    </PlayerNotesContext.Provider>
  );
};
