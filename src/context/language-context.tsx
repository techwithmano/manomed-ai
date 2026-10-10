"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar" | "es" | "zh" | "fr";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "🇸🇦" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", nativeName: "中文", dir: "ltr", flag: "🇨🇳" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr", flag: "🇫🇷" },
];

export const translations = {
  en: {
    // Navigation
    brandName: "ManoMed AI",
    navHome: "Home",
    navTriage: "Symptom Triage",
    navLabs: "Blood Work",
    navImaging: "X-Ray Vision",
    navStation: "Ward Station",
    navHistory: "Vault",
    navAbout: "Clinical Model",
    navContact: "Contact",
    navEmergency: "Emergency 911",
    signIn: "Sign In",
    signOut: "Sign Out",

    // Hero
    heroBadge: "Clinical Intelligence & Triage System",
    heroTitle: "Intelligent Medical Care for Everyone.",
    heroSubtitle:
      "Simple enough for a 60-year-old grandmother to understand without stress, and precise enough for hospital doctors and triage nurses.",
    btnStartTriage: "Start Health Assessment",
    btnOpenStation: "Hospital Ward Station",
    btnExploreLabs: "Blood Work Interpreter",
    btnExploreImaging: "X-Ray Diagnostics",

    // Pillars
    pillarsHeading: "Core Diagnostic Pillars",
    pillarsSubheading: "Three clinical tools designed for instant, evidence-backed evaluation.",
    pillarTriageTitle: "Symptom Triage & Intake",
    pillarTriageDesc:
      "Conversational, calm intake that pinpoints symptoms, alerts on red flags, and ranks differential diagnoses.",
    pillarLabsTitle: "Blood Work Pathology",
    pillarLabsDesc:
      "Instant analysis of CBC, CMP, lipids, and cardiac enzymes with clear High/Low indicators and clinical rationale.",
    pillarImagingTitle: "X-Ray & Radiology Assistant",
    pillarImagingDesc:
      "PACS viewer with contrast, brightness, and negative film inversion to detect fractures, infiltrates, and trauma.",

    // Dual Audience
    dualHeading: "Designed for Dual Clarity",
    patientViewTitle: "For Patients & Grandparents",
    patientViewDesc:
      "Jargon-free explanations, clear next steps, comforting guidance, and questions to ask your doctor.",
    doctorViewTitle: "For Doctors & Nurses",
    doctorViewDesc:
      "ICD-10 classifications, Bayesian differential likelihood percentages, and ready-to-copy EHR SOAP notes.",

    // Triage Tiers
    tierEmergency: "Emergency (Immediate)",
    tierUrgent: "Urgent (< 24-48 Hours)",
    tierRoutine: "Routine Clinic Visit",
    tierSelfCare: "Safe Home Supportive Care",

    // Common
    liveSyncActive: "Live Ward Sync",
    confidentialNotice: "Zero Data Sold • Client-Side Encryption Available",
    emergencyDisclaimer:
      "If you are experiencing chest pain, severe shortness of breath, sudden numbness, or heavy bleeding, call 911 or your local emergency number immediately.",
    footerRights: "ManoMed AI. All rights reserved. For clinical decision support.",
  },

  ar: {
    // Navigation
    brandName: "مانوميد للذكاء الطبي",
    navHome: "الرئيسية",
    navTriage: "تقييم الأعراض",
    navLabs: "تحاليل الدم",
    navImaging: "الأشعة السينية",
    navStation: "محطة الطاقم",
    navHistory: "السجل الطبي",
    navAbout: "النموذج السريري",
    navContact: "اتصل بنا",
    navEmergency: "طوارئ 911",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",

    // Hero
    heroBadge: "نظام الذكاء السريري والفرز الطبي",
    heroTitle: "تقييم طبي ذكي ودقيق ومتاح للجميع.",
    heroSubtitle:
      "مُصمم ببساطة فائقة لتفهمه الجدة بكل راحة ودون تعقيد، وبدقة سريرية موثوقة تلبي معايير أطباء المستشفيات وممرضي الطوارئ.",
    btnStartTriage: "بدء التقييم الطبي",
    btnOpenStation: "محطة الطاقم الطبي",
    btnExploreLabs: "تفسير تحاليل الدم",
    btnExploreImaging: "فحص الأشعة السينية",

    // Pillars
    pillarsHeading: "الركائز التشخيصية الأساسية",
    pillarsSubheading: "ثلاث أدوات سريرية متطورة لتشخيص فوري ومسنود بالأدلة الطبية.",
    pillarTriageTitle: "تقييم الأعراض والفرز الذكي",
    pillarTriageDesc:
      "استبيان هادئ وبسيط يحدد مواضع الألم، يكشف علامات الخطر الحرجة، ويرتب الاحتمالات التشخيصية بدقة.",
    pillarLabsTitle: "تفسير تحاليل الدم والمختبر",
    pillarLabsDesc:
      "تحليل فوري لفحوصات CBC وCMP وإنزيمات القلب والدهون مع مؤشرات واضحة للمعدلات الطبيعية والحرجة.",
    pillarImagingTitle: "مساعد الأشعة السينية والتصوير",
    pillarImagingDesc:
      "عارض إشعاعي PACS مع تحكم بالإضاءة والتباين وعكس الصورة للكشف عن الكسور والالتهابات الرئوية.",

    // Dual Audience
    dualHeading: "وضوح مزدوج: للمريض والطبيب",
    patientViewTitle: "للمرضى ولكبار السن",
    patientViewDesc:
      "شرح بلغة عربية مبسطة وخالية من المصطلحات المعقدة، مع نصائح واضحة وأسئلة تطرحها على طبيبك.",
    doctorViewTitle: "للأطباء وطاقم التمريض",
    doctorViewDesc:
      "رموز ICD-10 العالمية، نسب الاحتمال التفريقي، ومذكرات SOAP السريرية الجاهزة للنسخ في الملف الإلكتروني.",

    // Triage Tiers
    tierEmergency: "حالة طارئة (فوري)",
    tierUrgent: "حالة عاجلة (خلال 24-48 ساعة)",
    tierRoutine: "زيارة عيادة روتينية",
    tierSelfCare: "رعاية منزلية آمنة",

    // Common
    liveSyncActive: "مزامنة مباشرة مع الجناح",
    confidentialNotice: "بياناتك مشفرة بالكامل • حماية خصوصية مطلقة",
    emergencyDisclaimer:
      "إذا كنت تعاني من ألم حاد في الصدر، أو صعوبة شديدة في التنفس، أو تنميل مفاجئ، يرجى الاتصال بالإسعاف فوراً.",
    footerRights: "مانوميد للذكاء الطبي. جميع الحقوق محفوظة. نظام لدعم القرار السريري.",
  },

  es: {
    // Navigation
    brandName: "ManoMed AI",
    navHome: "Inicio",
    navTriage: "Triaje de Síntomas",
    navLabs: "Análisis de Sangre",
    navImaging: "Rayos X",
    navStation: "Estación Médica",
    navHistory: "Historial",
    navAbout: "Modelo Clínico",
    navContact: "Contacto",
    navEmergency: "Emergencia 911",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",

    // Hero
    heroBadge: "Sistema de Inteligencia Clínica y Triaje",
    heroTitle: "Atención médica inteligente para todos.",
    heroSubtitle:
      "Tan sencillo que una abuela de 60 años puede entenderlo sin estrés, y tan riguroso como exigen médicos y enfermeros de hospital.",
    btnStartTriage: "Iniciar Evaluación de Salud",
    btnOpenStation: "Estación de Guardia Médica",
    btnExploreLabs: "Intérprete de Laboratorio",
    btnExploreImaging: "Diagnóstico de Rayos X",

    // Pillars
    pillarsHeading: "Pilares Diagnósticos Clave",
    pillarsSubheading: "Tres herramientas clínicas para una evaluación instantánea basada en evidencia.",
    pillarTriageTitle: "Triaje de Síntomas e Ingreso",
    pillarTriageDesc:
      "Evaluación guiada y comprensible que identifica síntomas, alerta sobre banderas rojas y clasifica diagnósticos.",
    pillarLabsTitle: "Patología de Análisis de Sangre",
    pillarLabsDesc:
      "Interpretación inmediata de hemogramas, bioquímica, perfil lipídico y enzimas cardíacas con rangos de alerta.",
    pillarImagingTitle: "Asistente de Rayos X",
    pillarImagingDesc:
      "Visor PACS con contraste, brillo e inversión de película para detectar fracturas e infiltrados pulmonares.",

    // Dual Audience
    dualHeading: "Claridad Doble: Paciente y Médico",
    patientViewTitle: "Para Pacientes y Mayores",
    patientViewDesc:
      "Explicaciones claras sin tecnicismos, pasos a seguir sencillos y preguntas recomendadas para su médico.",
    doctorViewTitle: "Para Médicos y Enfermeros",
    doctorViewDesc:
      "Códigos ICD-10, porcentajes de probabilidad diferencial y notas SOAP listas para la historia clínica.",

    // Triage Tiers
    tierEmergency: "Emergencia (Inmediata)",
    tierUrgent: "Urgente (< 24-48 Horas)",
    tierRoutine: "Consulta de Rutina",
    tierSelfCare: "Cuidados en el Hogar",

    // Common
    liveSyncActive: "Sincronización en Vivo",
    confidentialNotice: "Privacidad Garantizada • Cifrado Seguro",
    emergencyDisclaimer:
      "Si presenta dolor torácico, dificultad respiratoria grave o debilidad repentina, llame a emergencias de inmediato.",
    footerRights: "ManoMed AI. Todos los derechos reservados. Soporte para decisiones clínicas.",
  },

  zh: {
    // Navigation
    brandName: "ManoMed AI 智医",
    navHome: "首页",
    navTriage: "症状分诊",
    navLabs: "验血分析",
    navImaging: "X光诊断",
    navStation: "医护工作站",
    navHistory: "健康档案",
    navAbout: "临床模型",
    navContact: "联系我们",
    navEmergency: "急救 120 / 911",
    signIn: "登录",
    signOut: "退出",

    // Hero
    heroBadge: "循证临床决策与智能分诊系统",
    heroTitle: "让每个人都能享受到智能精准的医疗关怀。",
    heroSubtitle:
      "界面极致简明，60岁老人亦能轻松自如地描述病情；同时兼具三甲医院临床医生与急诊护士所要求的专业严谨性。",
    btnStartTriage: "开始健康自测评估",
    btnOpenStation: "进入医院病区工作站",
    btnExploreLabs: "解读血液化验单",
    btnExploreImaging: "X光影像辅助诊断",

    // Pillars
    pillarsHeading: "核心临床诊断支柱",
    pillarsSubheading: "三大循证医学工具，提供即时、严谨的辅助评估。",
    pillarTriageTitle: "智能症状分诊与问卷",
    pillarTriageDesc: "温和友善的对话式问诊，实时筛查危急红旗警示，按概率排列鉴别诊断。",
    pillarLabsTitle: "血液化验与病理分析",
    pillarLabsDesc: "极速解读血常规、生化、心肌酶谱及血脂指标，智能标注异常偏高偏低值。",
    pillarImagingTitle: "X光医学影像工作站",
    pillarImagingDesc: "配备专业PACS阅片功能（缩放、反转、明暗对比），辅助识别骨折与肺部病变。",

    // Dual Audience
    dualHeading: "双重视角：患者明了，医生专业",
    patientViewTitle: "面向患者与长辈",
    patientViewDesc: "通俗易懂的日常语言，安心的就医指引，以及去医院前可向医生提出的重点问题。",
    doctorViewTitle: "面向医生与护理人员",
    doctorViewDesc: "标准化ICD-10编码、贝叶斯概率评分、以及可一键导入电子病历的完整SOAP病程记录。",

    // Triage Tiers
    tierEmergency: "🔴 紧急级（立即就医）",
    tierUrgent: "🟠 优先缓急（24-48小时内）",
    tierRoutine: "🔵 普通门诊（常规预约）",
    tierSelfCare: "🟢 居家护理（支持性休息）",

    // Common
    liveSyncActive: "病区实时同步中",
    confidentialNotice: "数据本地加密 • 严格保障隐私",
    emergencyDisclaimer: "如遇剧烈胸痛、突发呼吸困难、意识障碍或肢体麻木，请立即拨打急救电话。",
    footerRights: "ManoMed AI 智医系统。版权所有。仅供临床决策辅助。",
  },

  fr: {
    // Navigation
    brandName: "ManoMed AI",
    navHome: "Accueil",
    navTriage: "Triage des Symptômes",
    navLabs: "Analyses de Sang",
    navImaging: "Imagerie Rayons X",
    navStation: "Poste Médical",
    navHistory: "Dossiers",
    navAbout: "Modèle Clinique",
    navContact: "Contact",
    navEmergency: "Urgences 15 / 911",
    signIn: "Connexion",
    signOut: "Déconnexion",

    // Hero
    heroBadge: "Système d'Aide à la Décision Clinique",
    heroTitle: "Des soins médicaux intelligents pour tous.",
    heroSubtitle:
      "Assez simple pour qu'une grand-mère de 60 ans comprenne sans stress, et rigoureux pour répondre aux exigences des médecins et infirmiers hospitaliers.",
    btnStartTriage: "Démarrer l'Évaluation",
    btnOpenStation: "Poste de Garde Hospitalier",
    btnExploreLabs: "Interpréter les Analyses",
    btnExploreImaging: "Diagnostics Rayons X",

    // Pillars
    pillarsHeading: "Piliers Diagnostiques Essentiels",
    pillarsSubheading: "Trois outils cliniques pour une évaluation rapide et fondée sur des preuves.",
    pillarTriageTitle: "Triage des Symptômes",
    pillarTriageDesc:
      "Questionnaire rassurant et ciblé pour identifier les symptômes, détecter les signaux d'alerte et hiérarchiser les diagnostics.",
    pillarLabsTitle: "Pathologie Sanguine & Labo",
    pillarLabsDesc:
      "Interprétation instantanée des NFS, ionogrammes, enzymes cardiaques et bilans lipidiques avec seuils d'alerte.",
    pillarImagingTitle: "Assistant Imagerie Rayons X",
    pillarImagingDesc:
      "Visualiseur PACS avec contraste, zoom et inversion pour détecter fractures et anomalies thoraciques.",

    // Dual Audience
    dualHeading: "Double Clarté : Patient & Praticien",
    patientViewTitle: "Pour les Patients & Aînés",
    patientViewDesc:
      "Explications sans jargon médical complexe, étapes rassurantes et questions clés à poser à votre médecin.",
    doctorViewTitle: "Pour les Médecins & Infirmiers",
    doctorViewDesc:
      "Codage ICD-10, pourcentages de probabilité bayésienne et transmissions SOAP prêtes à copier.",

    // Triage Tiers
    tierEmergency: "Urgence Absolue (Immédiat)",
    tierUrgent: "Prioritaire (< 24-48 Heures)",
    tierRoutine: "Consultation Ordinaire",
    tierSelfCare: "Soins à Domicile",

    // Common
    liveSyncActive: "Synchronisation Directe",
    confidentialNotice: "Données Sécurisées • Chiffrement Avancé",
    emergencyDisclaimer:
      "En cas de douleur thoracique brutale, détresse respiratoire ou faiblesse soudaine, contactez immédiatement les urgences.",
    footerRights: "ManoMed AI. Tous droits réservés. Aide à la décision clinique.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  dir: "ltr" | "rtl";
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
  dir: "ltr",
  currentLanguageOption: LANGUAGES[0],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("manomed_lang") as Language;
      if (stored && translations[stored]) {
        setLanguageState(stored);
        applyLanguageToDOM(stored);
      }
    } catch (err) {
      console.warn("Could not read language from localStorage:", err);
    }
  }, []);

  const applyLanguageToDOM = (lang: Language) => {
    const isRtl = lang === "ar";
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    applyLanguageToDOM(lang);
    try {
      localStorage.setItem("manomed_lang", lang);
    } catch (err) {
      console.warn("Could not save language to localStorage:", err);
    }
  };

  const currentLanguageOption =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const t = translations[language] || translations.en;
  const dir = currentLanguageOption.dir;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
