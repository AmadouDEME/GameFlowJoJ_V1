import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Flame,
  Globe2,
  Heart,
  Languages,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Radio,
  Search,
  Shield,
  Signal,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Language = "fr" | "en" | "wo";
type Section = "events" | "map" | "live" | "rewards";
type EventItem = {
  id: number;
  sport: string;
  venue: string;
  time: string;
  date: string;
  crowd: "fluide" | "modéré" | "dense";
  status: "à venir" | "en direct" | "terminé";
};

type Place = {
  name: string;
  kind: string;
  x: string;
  y: string;
  crowd: number;
  eta: string;
};

const copy: Record<Language, { nav: string[]; ask: string; response: string; sos: string; offline: string }> = {
  fr: {
    nav: ["Programme", "Carte", "Live", "Récompenses"],
    ask: "Demander à GameFlow",
    response: "Itinéraire conseillé : Arène Dakar → Fan Zone Nord, 12 min. Affluence modérée, départ idéal dans 8 min.",
    sos: "SOS sécurité",
    offline: "Données prêtes hors ligne",
  },
  en: {
    nav: ["Schedule", "Map", "Live", "Rewards"],
    ask: "Ask GameFlow",
    response: "Recommended route: Dakar Arena → North Fan Zone, 12 min. Moderate traffic, best departure in 8 min.",
    sos: "Safety SOS",
    offline: "Offline data ready",
  },
  wo: {
    nav: ["Programme", "Kart", "Live", "Ndam"],
    ask: "Laaj GameFlow",
    response: "Yoonu rafet bi : Arène Dakar → Fan Zone Nord, 12 min. Nit ñi du bari, génn ci 8 min moo gën.",
    sos: "SOS kaaraange",
    offline: "Données yi am nañu offline",
  },
};

const events: EventItem[] = [
  { id: 1, sport: "Athlétisme", venue: "Stade Iba Mar Diop", time: "09:30", date: "Aujourd’hui", crowd: "modéré", status: "en direct" },
  { id: 2, sport: "Basket 3x3", venue: "Dakar Arena", time: "11:00", date: "Aujourd’hui", crowd: "dense", status: "à venir" },
  { id: 3, sport: "Natation", venue: "Piscine Olympique", time: "14:15", date: "Aujourd’hui", crowd: "fluide", status: "à venir" },
  { id: 4, sport: "Judo", venue: "Complexe Marius Ndiaye", time: "17:45", date: "Demain", crowd: "modéré", status: "à venir" },
];

const places: Place[] = [
  { name: "Dakar Arena", kind: "Compétition", x: "64%", y: "38%", crowd: 82, eta: "8 min" },
  { name: "Fan Zone Nord", kind: "Culture", x: "38%", y: "30%", crowd: 54, eta: "12 min" },
  { name: "Village JOJ", kind: "Hébergement", x: "48%", y: "66%", crowd: 35, eta: "6 min" },
  { name: "Hub Transport", kind: "Mobilité", x: "72%", y: "70%", crowd: 68, eta: "15 min" },
];

const missions = [
  { title: "Explorer 3 sites", points: 180, done: true },
  { title: "Scanner un billet", points: 90, done: true },
  { title: "Assister à un live", points: 140, done: false },
];

const tabs: Section[] = ["events", "map", "live", "rewards"];

function StatCard({ icon: Icon, label, value, trend }: { icon: typeof Activity; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon size={18} /></span>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{trend}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-card-foreground">{value}</p>
    </div>
  );
}

function EventCard({ event, favorite, onToggle }: { event: EventItem; favorite: boolean; onToggle: () => void }) {
  return (
    <article className="group rounded-xl border border-border bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", event.status === "en direct" ? "bg-live text-live-foreground" : "bg-secondary text-secondary-foreground")}>{event.status}</span>
            <span className="text-xs font-semibold text-muted-foreground">{event.date}</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-black text-card-foreground">{event.sport}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={15} />{event.venue}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Ajouter aux favoris"
          className={cn("grid size-10 shrink-0 place-items-center rounded-lg border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", favorite ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground")}
        >
          <Heart size={18} fill="currentColor" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="font-display text-2xl font-black text-primary">{event.time}</span>
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground"><Signal size={16} />Affluence {event.crowd}</span>
      </div>
    </article>
  );
}

function SmartMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative min-h-[360px] bg-map-pattern p-5">
        <div className="absolute left-[18%] top-[18%] h-[58%] w-[62%] rounded-full border border-primary/25" />
        <div className="absolute left-[10%] top-[55%] h-px w-[78%] rotate-[-12deg] bg-primary/40" />
        <div className="absolute left-[25%] top-[18%] h-[70%] w-px rotate-[28deg] bg-accent/70" />
        <div className="absolute inset-x-8 top-1/2 h-2 rounded-full bg-route shadow-glow" />
        {places.map((place) => (
          <div key={place.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: place.x, top: place.y }}>
            <div className="group relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
              <span className="relative grid size-11 place-items-center rounded-full border border-primary/40 bg-card text-primary shadow-glow"><MapPin size={19} /></span>
              <div className="pointer-events-none absolute left-1/2 top-12 w-44 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-popover-foreground opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
                <p className="font-bold">{place.name}</p>
                <p className="text-xs text-muted-foreground">{place.kind} · {place.eta}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${place.crowd}%` }} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => (
          <div key={place.name} className="rounded-lg bg-muted p-3">
            <p className="text-sm font-bold text-foreground">{place.name}</p>
            <p className="text-xs text-muted-foreground">{place.kind} · ETA {place.eta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GameFlowApp() {
  const [language, setLanguage] = useState<Language>("fr");
  const [active, setActive] = useState<Section>("events");
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [sosSent, setSosSent] = useState(false);
  const [ticketReady, setTicketReady] = useState(false);

  const filteredEvents = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return events;
    return events.filter((event) => `${event.sport} ${event.venue} ${event.status}`.toLowerCase().includes(normalized));
  }, [query]);

  const t = copy[language];

  const toggleFavorite = (id: number) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-hero-field opacity-90" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-40 rounded-2xl border border-border bg-card/85 px-4 py-3 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setActive("events")} className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow"><Flame size={22} /></span>
              <span className="text-left">
                <span className="block font-display text-xl font-black leading-none">GameFlow</span>
                <span className="text-xs font-semibold text-muted-foreground">JOJ Sénégal</span>
              </span>
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              {tabs.map((tab, index) => (
                <button key={tab} type="button" onClick={() => setActive(tab)} className={cn("rounded-lg px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>{t.nav[index]}</button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-lg border border-border bg-muted p-1 sm:flex">
                {(["fr", "en", "wo"] as Language[]).map((item) => (
                  <button key={item} type="button" onClick={() => setLanguage(item)} className={cn("rounded-md px-2.5 py-1 text-xs font-black uppercase transition-colors", language === item ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}>{item}</button>
                ))}
              </div>
              <Button variant="signal" size="sm" onClick={() => setSosSent(true)}><Shield size={16} />{t.sos}</Button>
              <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground lg:hidden"><Menu size={19} /></button>
            </div>
          </div>
          {menuOpen && (
            <div className="mt-3 grid gap-2 border-t border-border pt-3 lg:hidden">
              {tabs.map((tab, index) => <button key={tab} type="button" onClick={() => { setActive(tab); setMenuOpen(false); }} className="rounded-lg bg-muted px-4 py-3 text-left text-sm font-bold text-foreground">{t.nav[index]}</button>)}
            </div>
          )}
        </header>

        <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold shadow-soft"><Sparkles size={16} className="text-primary" />Plateforme web & mobile</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold shadow-soft"><WifiOff size={16} className="text-primary" />{t.offline}</span>
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
              L’expérience JOJ Sénégal, guidée en temps réel.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Une application centralisée pour naviguer, suivre les épreuves, recevoir des alertes, gagner des badges et rester assisté même avec une connexion limitée.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="xl" onClick={() => setActive("map")}>Ouvrir la carte <Navigation size={18} /></Button>
              <Button variant="premium" size="xl" onClick={() => setTicketReady(true)}>Préparer mon billet <Ticket size={18} /></Button>
            </div>
          </div>

          <div className="animate-float rounded-[2rem] border border-border bg-device p-3 shadow-deep">
            <div className="rounded-[1.55rem] border border-border bg-card p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-muted-foreground">Live hub</p>
                  <p className="font-display text-2xl font-black">Dakar Arena</p>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-live px-3 py-1 text-xs font-black text-live-foreground"><Radio size={14} />ON AIR</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={CalendarDays} label="Épreuves" value="42" trend="+8" />
                <StatCard icon={Bell} label="Alertes" value="12" trend="safe" />
                <StatCard icon={Trophy} label="Points" value="1 280" trend="top 5%" />
              </div>
              <div className="mt-4 rounded-xl bg-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-bold">Prochain itinéraire</p>
                  <p className="text-sm font-black text-primary">12 min</p>
                </div>
                <div className="relative h-24 overflow-hidden rounded-lg bg-map-pattern">
                  <div className="absolute inset-x-6 top-1/2 h-2 rounded-full bg-route shadow-glow" />
                  <span className="absolute left-8 top-8 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><CircleDot size={16} /></span>
                  <span className="absolute right-8 top-8 grid size-8 place-items-center rounded-full bg-accent text-accent-foreground"><MapPin size={16} /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 pb-10 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl font-black">Profil express</h2>
                <Globe2 size={18} className="text-primary" />
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Utilisateur</p>
                  <p className="font-bold">Awa Ndiaye · Visiteur</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Préférences</p>
                  <p className="font-bold">Basket · Athlétisme · Culture</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:hidden">
                  {(["fr", "en", "wo"] as Language[]).map((item) => <button key={item} type="button" onClick={() => setLanguage(item)} className={cn("rounded-lg px-2 py-2 text-xs font-black uppercase", language === item ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{item}</button>)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <h2 className="mb-3 font-display text-xl font-black">Accès rapides</h2>
              <div className="grid gap-2">
                <Button variant="soft" className="justify-start" onClick={() => setAssistantOpen(true)}><Bot size={17} />Assistant IA</Button>
                <Button variant="soft" className="justify-start" onClick={() => setTicketReady(true)}><Ticket size={17} />Billet offline</Button>
                <Button variant="soft" className="justify-start" onClick={() => setActive("rewards")}><Star size={17} />Missions</Button>
              </div>
            </div>
          </aside>

          <div className="rounded-2xl border border-border bg-panel p-4 shadow-soft sm:p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase text-primary"><Languages size={16} />Module actif</p>
                <h2 className="font-display text-3xl font-black">{active === "events" ? "Programme intelligent" : active === "map" ? "Smart Map" : active === "live" ? "Scores en temps réel" : "Gamification"}</h2>
              </div>
              <label className="relative block w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher sport, lieu, statut..." className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm font-medium outline-none transition-shadow focus:ring-2 focus:ring-ring" />
              </label>
            </div>

            {active === "events" && (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEvents.map((event) => <EventCard key={event.id} event={event} favorite={favorites.includes(event.id)} onToggle={() => toggleFavorite(event.id)} />)}
              </div>
            )}

            {active === "map" && <SmartMap />}

            {active === "live" && (
              <div className="grid gap-4 md:grid-cols-2">
                {["SEN", "FRA", "BRA", "JPN"].map((team, index) => (
                  <div key={team} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-live px-3 py-1 text-xs font-black text-live-foreground">LIVE</span>
                      <span className="text-sm font-bold text-muted-foreground">Quart {index + 1}</span>
                    </div>
                    <div className="flex items-center justify-between font-display text-3xl font-black">
                      <span>{team}</span><span>{18 + index * 7}</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${55 + index * 8}%` }} /></div>
                  </div>
                ))}
              </div>
            )}

            {active === "rewards" && (
              <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-display text-2xl font-black">Missions interactives</h3>
                  <div className="mt-4 space-y-3">
                    {missions.map((mission) => (
                      <div key={mission.title} className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("grid size-9 place-items-center rounded-lg", mission.done ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{mission.done ? <Check size={17} /> : <Zap size={17} />}</span>
                          <p className="font-bold">{mission.title}</p>
                        </div>
                        <p className="font-black text-primary">+{mission.points}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-prize p-5 text-prize-foreground shadow-glow">
                  <Trophy size={34} />
                  <p className="mt-6 text-sm font-bold uppercase opacity-80">Badge débloqué</p>
                  <h3 className="mt-1 font-display text-3xl font-black">Explorateur Dakar</h3>
                  <p className="mt-3 text-sm leading-6 opacity-90">Continuez vos missions pour grimper dans le classement visiteurs.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {assistantOpen && (
        <aside className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-deep backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Bot size={20} /></span><div><p className="font-display text-lg font-black">GameFlow AI</p><p className="text-xs text-muted-foreground">FR · EN · WO</p></div></div>
            <button type="button" onClick={() => setAssistantOpen(false)} className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><X size={17} /></button>
          </div>
          <div className="rounded-xl bg-muted p-3 text-sm leading-6">{t.response}</div>
          <div className="mt-3 flex gap-2">
            <Button variant="hero" className="flex-1"><MessageCircle size={16} />{t.ask}</Button>
            <Button variant="soft" size="icon" onClick={() => setActive("map")}><ChevronRight size={18} /></Button>
          </div>
        </aside>
      )}

      {(sosSent || ticketReady) && (
        <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-deep">
          <div className="flex items-start gap-3">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", sosSent ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground")}>{sosSent ? <AlertTriangle size={19} /> : <Ticket size={19} />}</span>
            <div className="flex-1">
              <p className="font-bold">{sosSent ? "Alerte envoyée à l’équipe sécurité" : "Billet synchronisé hors ligne"}</p>
              <p className="text-sm text-muted-foreground">{sosSent ? "Votre position et votre profil ont été préparés pour assistance." : "QR code, programme et carte restent accessibles sans connexion."}</p>
            </div>
            <button type="button" onClick={() => { setSosSent(false); setTicketReady(false); }} className="text-muted-foreground"><X size={18} /></button>
          </div>
        </div>
      )}
    </main>
  );
}
