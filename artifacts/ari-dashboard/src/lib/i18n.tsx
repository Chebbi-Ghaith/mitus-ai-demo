import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from "react";

export type Locale = "en" | "it" | "es" | "pt";

export const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

const translations = {
  en: {
    // Sidebar
    nav_dashboard: "Dashboard",
    nav_squad: "Squad",
    nav_sessions: "Sessions",
    nav_analysis: "CV Analysis",
    role_head_coach: "Head Coach",
    // Dashboard
    dashboard_title: "Squad Overview",
    dashboard_subtitle: "AI performance and risk analytics for the current week.",
    metric_active_squad: "Active Squad",
    metric_high_risk: "High Injury Risk",
    metric_requires_attention: "Requires attention",
    metric_avg_fatigue: "Avg Team Fatigue",
    metric_fatigue_change: "+4% from last week",
    metric_avg_hr: "Avg Heart Rate",
    metric_hr_subtitle: "During active sessions",
    chart_fatigue_title: "Team Fatigue Trend",
    chart_fatigue_subtitle: "Aggregate wearable data across all sessions",
    alert_critical_action: "Critical Action",
    alert_no_risk: "No players currently at high risk. Squad is in optimal condition.",
    label_fatigue: "Fatigue",
    // Players
    players_title: "Squad Roster",
    players_subtitle: "Manage players, view medical records and analyze performance.",
    players_search: "Search players...",
    players_add: "Add Player",
    players_none_title: "No players found",
    players_none_desc: "Try adjusting your search filters or add a new player to the squad to start tracking performance.",
    label_injury_risk: "Injury Risk",
    // Add player dialog
    dialog_add_player_title: "Add New Player",
    field_full_name: "Full Name",
    field_jersey_number: "Jersey Number",
    field_position: "Position",
    field_position_placeholder: "e.g. Forward",
    field_age: "Age",
    field_nationality: "Nationality",
    field_height: "Height (cm)",
    field_weight: "Weight (kg)",
    field_muscle_mass: "Muscle Mass (%)",
    btn_cancel: "Cancel",
    btn_save_player: "Save Player",
    btn_creating: "Creating...",
    // Sessions
    sessions_title: "Training & Match Sessions",
    sessions_subtitle: "Record and analyze team movements using Computer Vision.",
    sessions_create: "Create Session",
    sessions_none_title: "No sessions recorded",
    sessions_none_desc: "Create your first session to start analyzing player movements.",
    sessions_players_tracked: "players tracked",
    sessions_view_analysis: "View CV Analysis",
    // Create session dialog
    dialog_new_session_title: "New Session",
    field_session_title: "Session Title",
    field_session_title_placeholder: "e.g. Pre-match Tactical",
    field_type: "Type",
    type_training: "Training",
    type_match: "Match",
    type_recovery: "Recovery",
    field_duration: "Duration (mins)",
    btn_starting: "Starting...",
    btn_start_recording: "Start Recording",
    // Analysis
    analysis_back: "Back to Sessions",
    analysis_live_feed: "Live CV Feed",
    analysis_event_stream: "Event Stream",
    analysis_biomechanical: "Real-time biomechanical analysis",
    analysis_injury_risk: "Injury Risk",
    analysis_detected_issues: "Detected Issues:",
    // Player Profile
    profile_back: "Back to Squad",
    profile_yrs: "yrs",
    profile_height: "Height",
    profile_weight: "Weight",
    profile_muscle_mass: "Muscle Mass",
    profile_max_hr: "Max HR",
    tab_wearables: "Wearables",
    tab_medical: "Medical",
    tab_protocols: "Protocols",
    metric_current_fatigue: "Current Fatigue",
    metric_distance_today: "Distance Today",
    metric_top_speed: "Top Speed",
    chart_hr_title: "Heart Rate Zone (Last Session)",
    chart_hr_synced: "Live CV synced",
    medical_overview: "Overview",
    medical_clearance: "Clearance Status",
    medical_blood_type: "Blood Type",
    medical_last_exam: "Last Exam",
    medical_medications: "Medications & Allergies",
    medical_current_meds: "Current Medications",
    medical_allergies: "Allergies",
    medical_none_meds: "None recorded",
    medical_no_allergies: "No known allergies",
    medical_injury_history: "Injury History",
    medical_no_injuries: "No major injuries recorded.",
    status_recovered: "Recovered",
    status_active_issue: "Active Issue",
    protocols_title: "AI Prevention Protocols",
    protocols_badge: "Generated from CV Analysis",
    protocols_priority: "Priority",
    protocols_start: "Start Routine",
    protocols_none: "No protocols generated yet. Complete a CV analysis session to generate custom injury prevention routines.",
    // Settings
    settings_language: "Language",
    // Login
    login_title: "Welcome back, Coach.",
    login_subtitle: "Sign in to access your analytics dashboard.",
    login_button: "Log in",
    login_secure_note: "Your account is secured with industry-standard authentication.",
  },
  it: {
    nav_dashboard: "Dashboard",
    nav_squad: "Rosa",
    nav_sessions: "Sessioni",
    nav_analysis: "Analisi CV",
    role_head_coach: "Allenatore",
    dashboard_title: "Panoramica Squadra",
    dashboard_subtitle: "Analisi AI delle performance e dei rischi per la settimana in corso.",
    metric_active_squad: "Giocatori Attivi",
    metric_high_risk: "Alto Rischio Infortuni",
    metric_requires_attention: "Richiede attenzione",
    metric_avg_fatigue: "Fatica Media Squadra",
    metric_fatigue_change: "+4% rispetto alla scorsa settimana",
    metric_avg_hr: "FC Media",
    metric_hr_subtitle: "Durante le sessioni attive",
    chart_fatigue_title: "Andamento Fatica Squadra",
    chart_fatigue_subtitle: "Dati wearable aggregati su tutte le sessioni",
    alert_critical_action: "Azione Critica",
    alert_no_risk: "Nessun giocatore ad alto rischio. La squadra è in condizioni ottimali.",
    label_fatigue: "Fatica",
    players_title: "Rosa della Squadra",
    players_subtitle: "Gestisci i giocatori, visualizza le cartelle mediche e analizza le performance.",
    players_search: "Cerca giocatori...",
    players_add: "Aggiungi Giocatore",
    players_none_title: "Nessun giocatore trovato",
    players_none_desc: "Prova a modificare i filtri di ricerca o aggiungi un nuovo giocatore alla rosa.",
    label_injury_risk: "Rischio Infortuni",
    dialog_add_player_title: "Aggiungi Nuovo Giocatore",
    field_full_name: "Nome Completo",
    field_jersey_number: "Numero Maglia",
    field_position: "Ruolo",
    field_position_placeholder: "es. Attaccante",
    field_age: "Età",
    field_nationality: "Nazionalità",
    field_height: "Altezza (cm)",
    field_weight: "Peso (kg)",
    field_muscle_mass: "Massa Muscolare (%)",
    btn_cancel: "Annulla",
    btn_save_player: "Salva Giocatore",
    btn_creating: "Creazione...",
    sessions_title: "Allenamenti e Partite",
    sessions_subtitle: "Registra e analizza i movimenti della squadra con Computer Vision.",
    sessions_create: "Nuova Sessione",
    sessions_none_title: "Nessuna sessione registrata",
    sessions_none_desc: "Crea la prima sessione per iniziare ad analizzare i movimenti dei giocatori.",
    sessions_players_tracked: "giocatori monitorati",
    sessions_view_analysis: "Vedi Analisi CV",
    dialog_new_session_title: "Nuova Sessione",
    field_session_title: "Titolo Sessione",
    field_session_title_placeholder: "es. Tattica pre-partita",
    field_type: "Tipo",
    type_training: "Allenamento",
    type_match: "Partita",
    type_recovery: "Recupero",
    field_duration: "Durata (min)",
    btn_starting: "Avvio...",
    btn_start_recording: "Avvia Registrazione",
    analysis_back: "Torna alle Sessioni",
    analysis_live_feed: "Feed CV in Diretta",
    analysis_event_stream: "Stream di Eventi",
    analysis_biomechanical: "Analisi biomeccanica in tempo reale",
    analysis_injury_risk: "Rischio Infortuni",
    analysis_detected_issues: "Problemi Rilevati:",
    profile_back: "Torna alla Rosa",
    profile_yrs: "anni",
    profile_height: "Altezza",
    profile_weight: "Peso",
    profile_muscle_mass: "Massa Muscolare",
    profile_max_hr: "FC Max",
    tab_wearables: "Wearable",
    tab_medical: "Cartella Medica",
    tab_protocols: "Protocolli",
    metric_current_fatigue: "Fatica Attuale",
    metric_distance_today: "Distanza Oggi",
    metric_top_speed: "Velocità Max",
    chart_hr_title: "Zona Frequenza Cardiaca (Ultima Sessione)",
    chart_hr_synced: "Sincronizzato CV",
    medical_overview: "Panoramica",
    medical_clearance: "Idoneità Medica",
    medical_blood_type: "Gruppo Sanguigno",
    medical_last_exam: "Ultima Visita",
    medical_medications: "Farmaci e Allergie",
    medical_current_meds: "Farmaci Attuali",
    medical_allergies: "Allergie",
    medical_none_meds: "Nessuno registrato",
    medical_no_allergies: "Nessuna allergia nota",
    medical_injury_history: "Storico Infortuni",
    medical_no_injuries: "Nessun infortunio maggiore registrato.",
    status_recovered: "Recuperato",
    status_active_issue: "Problema Attivo",
    protocols_title: "Protocolli AI di Prevenzione",
    protocols_badge: "Generato da Analisi CV",
    protocols_priority: "Priorità",
    protocols_start: "Avvia Routine",
    protocols_none: "Nessun protocollo generato. Completa una sessione di analisi CV per generare routine personalizzate.",
    settings_language: "Lingua",
    login_title: "Bentornato, Coach.",
    login_subtitle: "Accedi per visualizzare il tuo pannello di analisi.",
    login_button: "Accedi",
    login_secure_note: "Il tuo account è protetto con autenticazione di livello industriale.",
  },
  es: {
    nav_dashboard: "Panel",
    nav_squad: "Plantilla",
    nav_sessions: "Sesiones",
    nav_analysis: "Análisis VC",
    role_head_coach: "Entrenador Jefe",
    dashboard_title: "Visión del Equipo",
    dashboard_subtitle: "Análisis AI de rendimiento y riesgo para la semana actual.",
    metric_active_squad: "Jugadores Activos",
    metric_high_risk: "Alto Riesgo de Lesión",
    metric_requires_attention: "Requiere atención",
    metric_avg_fatigue: "Fatiga Media del Equipo",
    metric_fatigue_change: "+4% respecto a la semana pasada",
    metric_avg_hr: "FC Media",
    metric_hr_subtitle: "Durante sesiones activas",
    chart_fatigue_title: "Tendencia de Fatiga del Equipo",
    chart_fatigue_subtitle: "Datos wearable agregados de todas las sesiones",
    alert_critical_action: "Acción Crítica",
    alert_no_risk: "Ningún jugador en alto riesgo. El equipo está en condición óptima.",
    label_fatigue: "Fatiga",
    players_title: "Plantilla del Equipo",
    players_subtitle: "Gestiona jugadores, revisa historiales médicos y analiza el rendimiento.",
    players_search: "Buscar jugadores...",
    players_add: "Añadir Jugador",
    players_none_title: "Ningún jugador encontrado",
    players_none_desc: "Ajusta los filtros o añade un nuevo jugador a la plantilla.",
    label_injury_risk: "Riesgo de Lesión",
    dialog_add_player_title: "Añadir Nuevo Jugador",
    field_full_name: "Nombre Completo",
    field_jersey_number: "Número de Camiseta",
    field_position: "Posición",
    field_position_placeholder: "ej. Delantero",
    field_age: "Edad",
    field_nationality: "Nacionalidad",
    field_height: "Altura (cm)",
    field_weight: "Peso (kg)",
    field_muscle_mass: "Masa Muscular (%)",
    btn_cancel: "Cancelar",
    btn_save_player: "Guardar Jugador",
    btn_creating: "Creando...",
    sessions_title: "Entrenamientos y Partidos",
    sessions_subtitle: "Registra y analiza los movimientos del equipo con Visión por Computadora.",
    sessions_create: "Crear Sesión",
    sessions_none_title: "Sin sesiones registradas",
    sessions_none_desc: "Crea tu primera sesión para empezar a analizar los movimientos de los jugadores.",
    sessions_players_tracked: "jugadores monitoreados",
    sessions_view_analysis: "Ver Análisis VC",
    dialog_new_session_title: "Nueva Sesión",
    field_session_title: "Título de la Sesión",
    field_session_title_placeholder: "ej. Táctica pre-partido",
    field_type: "Tipo",
    type_training: "Entrenamiento",
    type_match: "Partido",
    type_recovery: "Recuperación",
    field_duration: "Duración (min)",
    btn_starting: "Iniciando...",
    btn_start_recording: "Iniciar Grabación",
    analysis_back: "Volver a Sesiones",
    analysis_live_feed: "Feed VC en Vivo",
    analysis_event_stream: "Stream de Eventos",
    analysis_biomechanical: "Análisis biomecánico en tiempo real",
    analysis_injury_risk: "Riesgo de Lesión",
    analysis_detected_issues: "Problemas Detectados:",
    profile_back: "Volver a la Plantilla",
    profile_yrs: "años",
    profile_height: "Altura",
    profile_weight: "Peso",
    profile_muscle_mass: "Masa Muscular",
    profile_max_hr: "FC Máx",
    tab_wearables: "Wearables",
    tab_medical: "Historial Médico",
    tab_protocols: "Protocolos",
    metric_current_fatigue: "Fatiga Actual",
    metric_distance_today: "Distancia Hoy",
    metric_top_speed: "Velocidad Máx",
    chart_hr_title: "Zona de Frecuencia Cardíaca (Última Sesión)",
    chart_hr_synced: "Sincronizado VC",
    medical_overview: "Resumen",
    medical_clearance: "Estado Médico",
    medical_blood_type: "Tipo de Sangre",
    medical_last_exam: "Último Examen",
    medical_medications: "Medicamentos y Alergias",
    medical_current_meds: "Medicamentos Actuales",
    medical_allergies: "Alergias",
    medical_none_meds: "Ninguno registrado",
    medical_no_allergies: "Sin alergias conocidas",
    medical_injury_history: "Historial de Lesiones",
    medical_no_injuries: "Sin lesiones mayores registradas.",
    status_recovered: "Recuperado",
    status_active_issue: "Problema Activo",
    protocols_title: "Protocolos AI de Prevención",
    protocols_badge: "Generado desde Análisis VC",
    protocols_priority: "Prioridad",
    protocols_start: "Iniciar Rutina",
    protocols_none: "Sin protocolos. Completa una sesión de análisis VC para generar rutinas personalizadas.",
    settings_language: "Idioma",
    login_title: "Bienvenido, Entrenador.",
    login_subtitle: "Inicia sesión para acceder a tu panel de análisis.",
    login_button: "Iniciar sesión",
    login_secure_note: "Tu cuenta está protegida con autenticación de nivel industrial.",
  },
  pt: {
    nav_dashboard: "Painel",
    nav_squad: "Plantel",
    nav_sessions: "Sessões",
    nav_analysis: "Análise VC",
    role_head_coach: "Treinador Principal",
    dashboard_title: "Visão da Equipa",
    dashboard_subtitle: "Análise AI de desempenho e risco para a semana atual.",
    metric_active_squad: "Jogadores Ativos",
    metric_high_risk: "Alto Risco de Lesão",
    metric_requires_attention: "Requer atenção",
    metric_avg_fatigue: "Fadiga Média da Equipa",
    metric_fatigue_change: "+4% em relação à semana passada",
    metric_avg_hr: "FC Média",
    metric_hr_subtitle: "Durante sessões ativas",
    chart_fatigue_title: "Tendência de Fadiga da Equipa",
    chart_fatigue_subtitle: "Dados wearable agregados de todas as sessões",
    alert_critical_action: "Ação Crítica",
    alert_no_risk: "Nenhum jogador em alto risco. A equipa está em condição ótima.",
    label_fatigue: "Fadiga",
    players_title: "Plantel da Equipa",
    players_subtitle: "Gere jogadores, veja registos médicos e analisa o desempenho.",
    players_search: "Procurar jogadores...",
    players_add: "Adicionar Jogador",
    players_none_title: "Nenhum jogador encontrado",
    players_none_desc: "Ajuste os filtros ou adicione um novo jogador ao plantel.",
    label_injury_risk: "Risco de Lesão",
    dialog_add_player_title: "Adicionar Novo Jogador",
    field_full_name: "Nome Completo",
    field_jersey_number: "Número da Camisola",
    field_position: "Posição",
    field_position_placeholder: "ex. Avançado",
    field_age: "Idade",
    field_nationality: "Nacionalidade",
    field_height: "Altura (cm)",
    field_weight: "Peso (kg)",
    field_muscle_mass: "Massa Muscular (%)",
    btn_cancel: "Cancelar",
    btn_save_player: "Guardar Jogador",
    btn_creating: "A criar...",
    sessions_title: "Treinos e Jogos",
    sessions_subtitle: "Regista e analisa movimentos da equipa com Visão por Computador.",
    sessions_create: "Criar Sessão",
    sessions_none_title: "Sem sessões registadas",
    sessions_none_desc: "Cria a primeira sessão para começar a analisar os movimentos dos jogadores.",
    sessions_players_tracked: "jogadores monitorizados",
    sessions_view_analysis: "Ver Análise VC",
    dialog_new_session_title: "Nova Sessão",
    field_session_title: "Título da Sessão",
    field_session_title_placeholder: "ex. Tática pré-jogo",
    field_type: "Tipo",
    type_training: "Treino",
    type_match: "Jogo",
    type_recovery: "Recuperação",
    field_duration: "Duração (min)",
    btn_starting: "A iniciar...",
    btn_start_recording: "Iniciar Gravação",
    analysis_back: "Voltar às Sessões",
    analysis_live_feed: "Feed VC ao Vivo",
    analysis_event_stream: "Stream de Eventos",
    analysis_biomechanical: "Análise biomecânica em tempo real",
    analysis_injury_risk: "Risco de Lesão",
    analysis_detected_issues: "Problemas Detetados:",
    profile_back: "Voltar ao Plantel",
    profile_yrs: "anos",
    profile_height: "Altura",
    profile_weight: "Peso",
    profile_muscle_mass: "Massa Muscular",
    profile_max_hr: "FC Máx",
    tab_wearables: "Wearables",
    tab_medical: "Registo Médico",
    tab_protocols: "Protocolos",
    metric_current_fatigue: "Fadiga Atual",
    metric_distance_today: "Distância Hoje",
    metric_top_speed: "Velocidade Máx",
    chart_hr_title: "Zona de Frequência Cardíaca (Última Sessão)",
    chart_hr_synced: "Sincronizado VC",
    medical_overview: "Resumo",
    medical_clearance: "Estado Médico",
    medical_blood_type: "Tipo de Sangue",
    medical_last_exam: "Último Exame",
    medical_medications: "Medicamentos e Alergias",
    medical_current_meds: "Medicamentos Atuais",
    medical_allergies: "Alergias",
    medical_none_meds: "Nenhum registado",
    medical_no_allergies: "Sem alergias conhecidas",
    medical_injury_history: "Historial de Lesões",
    medical_no_injuries: "Sem lesões maiores registadas.",
    status_recovered: "Recuperado",
    status_active_issue: "Problema Ativo",
    protocols_title: "Protocolos AI de Prevenção",
    protocols_badge: "Gerado a partir de Análise VC",
    protocols_priority: "Prioridade",
    protocols_start: "Iniciar Rotina",
    protocols_none: "Sem protocolos. Completa uma sessão de análise VC para gerar rotinas personalizadas.",
    settings_language: "Idioma",
    login_title: "Bem-vindo, Treinador.",
    login_subtitle: "Entre para acessar o seu painel de análise.",
    login_button: "Entrar",
    login_secure_note: "A sua conta está protegida com autenticação de nível industrial.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Map country codes to supported locales
function detectLocaleFromCountry(country: string): Locale {
  const c = country.toUpperCase();
  const IT = ["IT"];
  const ES = ["ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "BO", "PY", "UY", "CR", "PA", "DO", "HN", "SV", "GT", "NI", "CU", "PR", "GQ"];
  const PT = ["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "TL"];
  if (IT.includes(c)) return "it";
  if (ES.includes(c)) return "es";
  if (PT.includes(c)) return "pt";
  return "en";
}

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem("ari_locale") as Locale;
    if (saved && Object.keys(translations).includes(saved)) return saved;
  } catch {}
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Auto-detect language from IP on first visit (only when no preference saved)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ari_locale");
      if (saved) return; // respect explicit user preference
    } catch {}

    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then((data: { country_code?: string }) => {
        if (data.country_code) {
          const detected = detectLocaleFromCountry(data.country_code);
          setLocaleState(detected);
        }
      })
      .catch(() => {
        // fallback: try browser language
        try {
          const browserLang = navigator.language?.slice(0, 2).toLowerCase();
          const map: Record<string, Locale> = { it: "it", es: "es", pt: "pt", en: "en" };
          if (browserLang && map[browserLang]) setLocaleState(map[browserLang]);
        } catch {}
      });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("ari_locale", l); } catch {}
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[locale] as Record<string, string>;
      const fallback = translations.en as Record<string, string>;
      return dict[key] ?? fallback[key] ?? key;
    },
    [locale]
  );

  // Expose both locale/setLocale and language/setLanguage as aliases
  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
