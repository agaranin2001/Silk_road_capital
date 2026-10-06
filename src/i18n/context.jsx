import { createContext, useContext } from "react";

// Content for the current language (see buildContent): { site, home, services, …, t, href, locale, lang }.
const ContentContext = createContext(null);

export const ContentProvider = ({ content, children }) => <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;

/** const { home, t, href } = useContent(); */
export const useContent = () => {
  const c = useContext(ContentContext);
  if (!c) throw new Error("useContent() outside <ContentProvider>");
  return c;
};
