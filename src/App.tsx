import { useEffect, useState } from "react";
import { ClassicGame } from "./classic/ClassicGame";
import { Host } from "./game/Host";
import { Player } from "./game/Player";
import { Home } from "./Home";
import { Demo } from "./game/Demo";
import { BadgeAlbum } from "./badges/Cards";
import { Fit } from "./shared/Fit";
import { MissionPanel } from "./game/MissionPanel";
import { stations } from "./game/map";
import { load, save } from "./shared/storage";
import type { Lang } from "./shared/proximity";

type Route = { name: "home" } | { name: "classic" } | { name: "host" } | { name: "badges" } | { name: "demo" } | { name: "join"; code: string };

function parse(path: string): Route {
  const j = path.match(/^\/join\/([A-Za-z0-9]{3,8})\/?$/);
  if (j) return { name: "join", code: j[1].toUpperCase() };
  if (path.startsWith("/classic")) return { name: "classic" };
  if (path.startsWith("/host")) return { name: "host" };
  if (path.startsWith("/badges")) return { name: "badges" };
  if (path.startsWith("/demo")) return { name: "demo" };
  return { name: "home" };
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parse(location.pathname));
  const [lang, setLangState] = useState<Lang>(() => (load<string>("impostor.lang.v2", "en") === "es" ? "es" : "en"));
  const setLang = (l: Lang) => { save("impostor.lang.v2", l); setLangState(l); };

  useEffect(() => {
    const onPop = () => setRoute(parse(location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (path: string) => {
    history.pushState(null, "", path);
    setRoute(parse(path));
  };

  const dev = import.meta.env.DEV && location.pathname.match(/^\/dev\/mission\/(\w+)/);
  if (dev) {
    const st = stations.find((x) => x.mission === dev[1]) || stations[0];
    return <div className="page"><MissionPanel station={st} level={new URLSearchParams(location.search).get("level") || "A2"} lang={lang} fake={false} onDone={() => {}} onClose={() => {}} /></div>;
  }
  if (route.name === "classic") return <ClassicGame lang={lang} setLang={setLang} onExit={() => go("/")} />;
  if (route.name === "host") return <Host onExit={() => go("/")} />;
  if (route.name === "demo") return <Demo lang={lang} onExit={() => go("/")} />;
  if (route.name === "join") return <Player code={route.code} onExit={() => go("/")} />;
  if (route.name === "badges") return <div className="page"><Fit><BadgeAlbum lang={lang} onClose={() => go("/")} /></Fit></div>;
  return <Home lang={lang} setLang={setLang} go={go} />;
}
