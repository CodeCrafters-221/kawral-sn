import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Compass,
  Globe,
  Laptop,
  MapPin,
  Megaphone,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Sparkles,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Pagination,
} from "../../../components/ui";
import type {
  AnalyticsDashboardResponse,
  AnalyticsPeriod,
} from "../../../server/ga4Service";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

export const AdminGoogleAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // États de pagination pour chaque tableau analytique
  const [sourcesPage, setSourcesPage] = useState(1);
  const [sourcesPageSize, setSourcesPageSize] = useState(5);

  const [pagesPage, setPagesPage] = useState(1);
  const [pagesPageSize, setPagesPageSize] = useState(5);

  const [eventsPage, setEventsPage] = useState(1);
  const [eventsPageSize, setEventsPageSize] = useState(5);

  const [locationsPage, setLocationsPage] = useState(1);
  const [locationsPageSize, setLocationsPageSize] = useState(5);

  const [browsersPage, setBrowsersPage] = useState(1);
  const [browsersPageSize, setBrowsersPageSize] = useState(5);

  const fetchAnalytics = useCallback(
    async (selectedPeriod: AnalyticsPeriod, isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/analytics?period=${encodeURIComponent(selectedPeriod)}`,
        );
        if (!res.ok) {
          throw new Error("Impossible de récupérer les données Google Analytics.");
        }
        const json = (await res.json()) as AnalyticsDashboardResponse;
        setData(json);
      } catch (err: any) {
        setError(
          err?.message || "Erreur lors du chargement des données Google Analytics.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  // Rafraîchissement automatique du temps réel toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      fetchAnalytics(period, true);
    }, 30_000);
    return () => clearInterval(timer);
  }, [period, fetchAnalytics]);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
    setSourcesPage(1);
    setPagesPage(1);
    setEventsPage(1);
    setLocationsPage(1);
    setBrowsersPage(1);
  };

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-kawral-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-kawral-dark">
            Connexion à Google Analytics ({period === "today" ? "Aujourd'hui" : period === "7d" ? "7 jours" : "30 jours"})...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-200">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-rose-600">
            {error || "Données indisponibles."}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAnalytics(period)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeMetrics = data.periods[period];
  const maxDailyUsers = Math.max(
    1,
    ...data.dailySeries.map((pt) => pt.activeUsers),
  );
  const maxRealtimeMin = Math.max(
    1,
    ...data.realtime.perMinute.map((pt) => pt.activeUsers),
  );

  const pagedSources = data.marketing.sources.slice(
    (sourcesPage - 1) * sourcesPageSize,
    sourcesPage * sourcesPageSize,
  );
  const pagedPages = data.marketing.topPages.slice(
    (pagesPage - 1) * pagesPageSize,
    pagesPage * pagesPageSize,
  );
  const pagedEvents = data.marketing.events.slice(
    (eventsPage - 1) * eventsPageSize,
    eventsPage * eventsPageSize,
  );
  const pagedLocations = data.visitors.locations.slice(
    (locationsPage - 1) * locationsPageSize,
    locationsPage * locationsPageSize,
  );
  const pagedBrowsers = data.visitors.browsers.slice(
    (browsersPage - 1) * browsersPageSize,
    browsersPage * browsersPageSize,
  );

  const periodLabels: Record<AnalyticsPeriod, string> = {
    today: "Aujourd'hui",
    "7d": "7 derniers jours",
    "30d": "30 derniers jours",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── En-tête Google Analytics & Sélecteur de période ── */}
      <div className="bg-white rounded-3xl border border-kawral-border p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-kawral-green/10 text-kawral-green">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
              Google Analytics 4 — Performance, Trafic & Marketing
            </h2>
            <Badge variant="success" size="sm">
              Tag : {data.measurementId}
            </Badge>
            <Badge variant="accent" size="sm">
              Flux : {data.streamName} (#{data.streamId})
            </Badge>
            {data.measurementProtocolActive && (
              <Badge variant="success" size="sm">
                API Measurement Protocol Active
              </Badge>
            )}
          </div>
          <p className="text-xs text-kawral-muted">
            Flux connecté : <strong className="text-kawral-dark">{data.streamUrl}</strong> • Suivi en direct du trafic (Aujourd'hui, 7j, 30j), temps réel, acquisitions marketing et infos visiteurs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="inline-flex items-center bg-kawral-ivory p-1 rounded-2xl border border-kawral-border">
            {(["today", "7d", "30d"] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  period === p
                    ? "bg-kawral-green text-white shadow-xs"
                    : "text-kawral-muted hover:text-kawral-dark"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(period, true)}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-kawral-green" : ""}`}
              />
            }
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* ── 1. Cartes Comparatives du Trafic : Aujourd'hui / 7 Jours / 30 Jours ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            {
              key: "today" as const,
              title: "Trafic Aujourd'hui",
              subtitle: "Dernières 24 heures",
              accent: "border-emerald-200 bg-emerald-50/30",
            },
            {
              key: "7d" as const,
              title: "Trafic 7 Jours",
              subtitle: "Hebdomadaire glissant",
              accent: "border-kawral-green/30 bg-kawral-ivory/60",
            },
            {
              key: "30d" as const,
              title: "Trafic 30 Jours",
              subtitle: "Mensuel glissant",
              accent: "border-orange-200 bg-orange-50/20",
            },
          ] as const
        ).map((card) => {
          const m = data.periods[card.key];
          const isSelected = period === card.key;
          return (
            <div
              key={card.key}
              onClick={() => handlePeriodChange(card.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handlePeriodChange(card.key);
                }
              }}
              className={`rounded-3xl border p-5 transition-all cursor-pointer ${
                isSelected
                  ? "ring-2 ring-kawral-green border-kawral-green bg-white shadow-md"
                  : `${card.accent} hover:bg-white hover:shadow-sm`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-kawral-dark">
                    {card.title}
                  </span>
                  <p className="text-[11px] text-kawral-muted">{card.subtitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />+{m.trendUsersPct}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-kawral-border/70">
                <div>
                  <span className="text-[10px] font-bold text-kawral-muted uppercase">
                    Visiteurs
                  </span>
                  <p className="text-xl font-black text-kawral-green">
                    {m.activeUsers.toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-kawral-muted uppercase">
                    Sessions
                  </span>
                  <p className="text-xl font-black text-kawral-dark">
                    {m.sessions.toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-kawral-muted uppercase">
                    Pages vues
                  </span>
                  <p className="text-xl font-black text-kawral-orange">
                    {m.pageViews.toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. Trafic en Temps Réel & Courbe d'évolution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte Temps Réel (30 dernières minutes) */}
        <Card className="border-emerald-200/80 bg-gradient-to-br from-kawral-darkgreen to-[#0B4D45] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-black">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                </span>
                <span>Trafic en Temps Réel</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full text-emerald-200">
                En direct (30 min)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-4xl font-black text-white">
                  {data.realtime.activeUsersLast30Min}
                </p>
                <span className="text-[11px] text-emerald-200 font-semibold">
                  visiteurs actifs sur les 30 dernières min
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-kawral-orange">
                  {data.realtime.activeUsersLast5Min}
                </p>
                <span className="text-[10px] text-slate-300">
                  en ligne (5 min)
                </span>
              </div>
            </div>

            {/* Histogramme par minute */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>Activité par minute</span>
                <span>Maintenant</span>
              </div>
              <div className="flex items-end gap-1 h-14 pt-2">
                {data.realtime.perMinute.slice(-20).map((pt) => {
                  const hPct = Math.max(
                    14,
                    Math.round((pt.activeUsers / maxRealtimeMin) * 100),
                  );
                  return (
                    <div
                      key={pt.minutesAgo}
                      title={`Il y a ${pt.minutesAgo} min : ${pt.activeUsers} visiteur(s)`}
                      style={{ height: `${hPct}%` }}
                      className="flex-1 bg-emerald-400/80 hover:bg-kawral-orange rounded-t-sm transition-all"
                    />
                  );
                })}
              </div>
            </div>

            {/* Top pages actives en direct */}
            <div className="space-y-2 pt-2 border-t border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Pages actives en ce moment
              </span>
              <div className="space-y-1.5">
                {data.realtime.activePages.slice(0, 4).map((pg) => (
                  <div
                    key={pg.path}
                    className="flex items-center justify-between text-xs bg-white/10 rounded-xl px-3 py-1.5"
                  >
                    <span className="truncate font-semibold text-white max-w-[200px]">
                      {pg.path}
                    </span>
                    <span className="font-black text-emerald-300 text-xs shrink-0">
                      {pg.activeUsers} actif{pg.activeUsers > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graphique d'évolution & KPIs de la période sélectionnée */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-kawral-green" />
                <span>
                  Évolution du trafic — {periodLabels[period]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-kawral-muted">
                  <Clock className="w-3.5 h-3.5 text-kawral-green" />
                  Durée moy. :{" "}
                  <strong className="text-kawral-dark">
                    {formatDuration(activeMetrics.avgSessionDurationSec)}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-kawral-muted">
                  <Sparkles className="w-3.5 h-3.5 text-kawral-orange" />
                  Engagement :{" "}
                  <strong className="text-kawral-dark">
                    {activeMetrics.engagementRate}%
                  </strong>
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Bar chart interactif */}
            <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 px-1 border-b border-kawral-border pb-2">
              {data.dailySeries.map((pt) => {
                const heightPct = Math.max(
                  10,
                  Math.round((pt.activeUsers / maxDailyUsers) * 100),
                );
                return (
                  <div
                    key={pt.date}
                    className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end min-w-0"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-kawral-green bg-kawral-ivory px-1.5 py-0.5 rounded border border-kawral-border whitespace-nowrap">
                      {pt.activeUsers} vis. · {pt.pageViews} vues
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[28px] rounded-t-xl bg-kawral-green/85 group-hover:bg-kawral-orange transition-all"
                      title={`${pt.label} : ${pt.activeUsers} visiteurs, ${pt.sessions} sessions, ${pt.pageViews} pages vues`}
                    />
                    <span className="text-[9px] font-bold text-kawral-muted truncate max-w-full">
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 4 mini-KPIs de performance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-kawral-ivory border border-kawral-border/70">
                <span className="text-[10px] font-bold text-kawral-muted uppercase">
                  Visiteurs uniques
                </span>
                <p className="text-lg font-black text-kawral-green mt-0.5">
                  {activeMetrics.activeUsers.toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-kawral-ivory border border-kawral-border/70">
                <span className="text-[10px] font-bold text-kawral-muted uppercase">
                  Sessions totales
                </span>
                <p className="text-lg font-black text-kawral-dark mt-0.5">
                  {activeMetrics.sessions.toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-kawral-ivory border border-kawral-border/70">
                <span className="text-[10px] font-bold text-kawral-muted uppercase">
                  Pages consultées
                </span>
                <p className="text-lg font-black text-kawral-dark mt-0.5">
                  {activeMetrics.pageViews.toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                <span className="text-[10px] font-bold text-kawral-orange uppercase">
                  Contacts & Conversions
                </span>
                <p className="text-lg font-black text-kawral-orange mt-0.5">
                  {activeMetrics.conversions.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Données Marketing & Acquisition (avec Pagination) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canaux d'acquisition */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Megaphone className="w-4 h-4 text-kawral-orange" />
              <span>Canaux d'Acquisition Marketing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {data.marketing.channels.map((ch) => (
              <div key={ch.channel} className="space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-kawral-dark truncate pr-2">
                    {ch.channel}
                  </span>
                  <span className="text-kawral-green shrink-0">
                    {ch.sessions} sess. ({ch.sharePct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-kawral-ivory rounded-full overflow-hidden">
                  <div
                    className="h-full bg-kawral-green rounded-full transition-all"
                    style={{ width: `${Math.min(100, ch.sharePct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-kawral-muted">
                  <span>{ch.activeUsers} visiteurs uniques</span>
                  <span>
                    {ch.conversions} conversions • {ch.engagementRate}% engag.
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tableau paginé des Sources / Supports UTM & Campagnes */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-kawral-green" />
                <span>Sources de Trafic, Supports & Campagnes UTM</span>
              </div>
              <Badge variant="accent" size="sm">
                {data.marketing.sources.length} sources
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kawral-ivory text-kawral-muted border-y border-kawral-border">
                <tr>
                  <th className="p-3.5">Source / Support</th>
                  <th className="p-3.5">Campagne</th>
                  <th className="p-3.5">Visiteurs</th>
                  <th className="p-3.5">Sessions</th>
                  <th className="p-3.5 text-right">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {pagedSources.map((src) => (
                  <tr
                    key={src.id}
                    className="border-t border-kawral-border/70 hover:bg-kawral-ivory/40"
                  >
                    <td className="p-3.5 font-extrabold text-kawral-dark">
                      {src.sourceMedium}
                    </td>
                    <td className="p-3.5 text-kawral-muted">
                      <span className="bg-kawral-ivory px-2 py-0.5 rounded-lg border border-kawral-border text-[11px] font-semibold">
                        {src.campaign}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold">{src.users}</td>
                    <td className="p-3.5 font-bold">{src.sessions}</td>
                    <td className="p-3.5 text-right">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                        {src.conversions} ({src.conversionRate}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={sourcesPage}
              totalItems={data.marketing.sources.length}
              pageSize={sourcesPageSize}
              onPageChange={setSourcesPage}
              onPageSizeChange={setSourcesPageSize}
              pageSizeOptions={[5, 10]}
              itemLabel="sources marketing"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Événements Clés Marketing & Pages les plus vues (Paginés) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-kawral-orange" />
                <span>Événements Clés & Conversions (GA4)</span>
              </div>
              <Badge variant="default" size="sm">
                {data.marketing.events.length} types
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kawral-ivory text-kawral-muted border-y border-kawral-border">
                <tr>
                  <th className="p-3.5">Action / Événement</th>
                  <th className="p-3.5">Code GA4</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-right">Utilisateurs</th>
                </tr>
              </thead>
              <tbody>
                {pagedEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="border-t border-kawral-border/70 hover:bg-kawral-ivory/40"
                  >
                    <td className="p-3.5 font-bold text-kawral-dark">
                      {evt.label}
                    </td>
                    <td className="p-3.5">
                      <code className="text-[11px] bg-slate-100 text-kawral-green px-2 py-0.5 rounded-md font-bold">
                        {evt.eventName}
                      </code>
                    </td>
                    <td className="p-3.5 text-right font-black text-kawral-green">
                      {evt.count.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-kawral-muted">
                      {evt.uniqueUsers.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={eventsPage}
              totalItems={data.marketing.events.length}
              pageSize={eventsPageSize}
              onPageChange={setEventsPage}
              onPageSizeChange={setEventsPageSize}
              pageSizeOptions={[5, 9]}
              itemLabel="événements"
            />
          </CardContent>
        </Card>

        {/* Pages les plus consultées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-kawral-green" />
                <span>Pages & Catégories les plus visitées</span>
              </div>
              <Badge variant="default" size="sm">
                {data.marketing.topPages.length} pages
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kawral-ivory text-kawral-muted border-y border-kawral-border">
                <tr>
                  <th className="p-3.5">Page</th>
                  <th className="p-3.5 text-right">Vues</th>
                  <th className="p-3.5 text-right">Visiteurs</th>
                  <th className="p-3.5 text-right">Temps moy.</th>
                </tr>
              </thead>
              <tbody>
                {pagedPages.map((pg) => (
                  <tr
                    key={pg.id}
                    className="border-t border-kawral-border/70 hover:bg-kawral-ivory/40"
                  >
                    <td className="p-3.5">
                      <p className="font-bold text-kawral-dark truncate max-w-[220px]">
                        {pg.title}
                      </p>
                      <span className="text-[10px] text-kawral-muted font-mono">
                        {pg.path}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-kawral-green">
                      {pg.views.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5 text-right font-semibold">
                      {pg.uniqueUsers.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5 text-right text-kawral-muted font-semibold">
                      {formatDuration(pg.avgDurationSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={pagesPage}
              totalItems={data.marketing.topPages.length}
              pageSize={pagesPageSize}
              onPageChange={setPagesPage}
              onPageSizeChange={setPagesPageSize}
              pageSizeOptions={[5, 10]}
              itemLabel="pages"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── 5. Infos des Visiteurs (Appareils, Fidélité, Localisations & Navigateurs paginés) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appareils & Fidélité */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-kawral-green" />
              <span>Profil & Appareils des Visiteurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            {/* Nouveaux vs Récurrents */}
            <div className="p-4 rounded-2xl bg-kawral-ivory border border-kawral-border space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-kawral-dark">
                  Nouveaux visiteurs ({data.visitors.newVisitorsPct}%)
                </span>
                <span className="text-kawral-green">
                  Récurrents ({data.visitors.returningVisitorsPct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                <div
                  className="h-full bg-kawral-green"
                  style={{ width: `${data.visitors.newVisitorsPct}%` }}
                />
                <div
                  className="h-full bg-kawral-orange"
                  style={{ width: `${data.visitors.returningVisitorsPct}%` }}
                />
              </div>
            </div>

            {/* Appareils : Mobile / Desktop / Tablette */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-kawral-muted">
                Répartition par appareil
              </span>
              {data.visitors.devices.map((dev) => {
                const Icon =
                  dev.category === "Mobile"
                    ? Smartphone
                    : dev.category === "Desktop"
                      ? Laptop
                      : Tablet;
                return (
                  <div key={dev.category} className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2 text-kawral-dark">
                        <Icon className="w-4 h-4 text-kawral-green" />
                        {dev.category}
                      </span>
                      <span className="text-kawral-dark">
                        {dev.users.toLocaleString("fr-FR")} ({dev.sharePct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-kawral-ivory rounded-full overflow-hidden">
                      <div
                        className="h-full bg-kawral-green rounded-full"
                        style={{ width: `${dev.sharePct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigateurs & OS paginés */}
            <div className="pt-2 border-t border-kawral-border space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-kawral-muted">
                Navigateurs & Systèmes
              </span>
              <div className="space-y-2">
                {pagedBrowsers.map((br) => (
                  <div
                    key={br.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-kawral-border/40 last:border-none"
                  >
                    <div>
                      <span className="font-bold text-kawral-dark">
                        {br.browser}
                      </span>{" "}
                      <span className="text-[10px] text-kawral-muted">
                        ({br.os})
                      </span>
                    </div>
                    <span className="font-bold text-kawral-green">
                      {br.sharePct}%
                    </span>
                  </div>
                ))}
              </div>
              <Pagination
                page={browsersPage}
                totalItems={data.visitors.browsers.length}
                pageSize={browsersPageSize}
                onPageChange={setBrowsersPage}
                itemLabel="navigateurs"
                className="px-0 py-2 border-t-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Provenance Géographique des Visiteurs (Paginé) */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-kawral-orange" />
                <span>Origine Géographique des Visiteurs (Villes & Pays)</span>
              </div>
              <Badge variant="accent" size="sm">
                {data.visitors.locations.length} localisations
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kawral-ivory text-kawral-muted border-y border-kawral-border">
                <tr>
                  <th className="p-3.5">Ville / Zone</th>
                  <th className="p-3.5">Pays</th>
                  <th className="p-3.5">Visiteurs</th>
                  <th className="p-3.5">Sessions</th>
                  <th className="p-3.5">Part du trafic</th>
                </tr>
              </thead>
              <tbody>
                {pagedLocations.map((loc) => (
                  <tr
                    key={loc.id}
                    className="border-t border-kawral-border/70 hover:bg-kawral-ivory/40"
                  >
                    <td className="p-3.5 font-extrabold text-kawral-dark">
                      {loc.city}
                    </td>
                    <td className="p-3.5 text-kawral-muted font-semibold">
                      {loc.country}
                    </td>
                    <td className="p-3.5 font-bold text-kawral-green">
                      {loc.users.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5 font-semibold">
                      {loc.sessions.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5 w-44">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-kawral-ivory rounded-full overflow-hidden">
                          <div
                            className="h-full bg-kawral-orange rounded-full"
                            style={{ width: `${Math.min(100, loc.sharePct)}%` }}
                          />
                        </div>
                        <span className="font-bold text-kawral-dark w-10 text-right">
                          {loc.sharePct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={locationsPage}
              totalItems={data.visitors.locations.length}
              pageSize={locationsPageSize}
              onPageChange={setLocationsPage}
              onPageSizeChange={setLocationsPageSize}
              pageSizeOptions={[5, 10]}
              itemLabel="localisations"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
