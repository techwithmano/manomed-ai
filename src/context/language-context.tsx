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
    navTriage: "Check Symptoms",
    navLabs: "Blood Tests",
    navImaging: "X-Rays & Scans",
    navStation: "Doctor Dashboard",
    navHistory: "My Records",
    navAbout: "About Us",
    navContact: "Help & Contact",
    navEmergency: "Emergency Help",
    signIn: "Sign In",
    signOut: "Sign Out",

    // Hero
    heroBadge: "Smart & Simple Health Assistant",
    heroTitle: "Clear Medical Answers in Plain Everyday Words.",
    heroSubtitle:
      "Simple enough for any family member to understand without worry or confusion, and detailed enough to share directly with your doctor.",
    btnStartTriage: "Check My Symptoms",
    btnOpenStation: "Doctor & Clinic Dashboard",
    btnExploreLabs: "Understand Blood Tests",
    btnExploreImaging: "Look at Scans & X-Rays",

    // Pillars
    pillarsHeading: "How ManoMed Helps You",
    pillarsSubheading: "Three easy tools to help you understand your body and take the right next steps.",
    pillarTriageTitle: "Symptom Checker",
    pillarTriageDesc:
      "A calm, simple step-by-step guide to help pinpoint what's bothering you and tell you if you need to see a doctor.",
    pillarLabsTitle: "Blood Test Explainer",
    pillarLabsDesc:
      "See what your test results mean with simple Normal, High, and Low indicators instead of confusing lab numbers.",
    pillarImagingTitle: "Scan & X-Ray Viewer",
    pillarImagingDesc:
      "Easily view chest and bone X-rays with simple brightness, contrast, and zoom controls.",

    // Dual Audience
    dualHeading: "Simple for You, Helpful for Your Doctor",
    patientViewTitle: "For You & Your Family",
    patientViewDesc:
      "Everyday words, clear next steps, comforting advice, and helpful questions to ask at the clinic.",
    doctorViewTitle: "For Your Doctor or Nurse",
    doctorViewDesc:
      "An organized summary of your symptoms and timeline so your doctor can review your visit in seconds.",

    // Triage Tiers
    tierEmergency: "🚨 Emergency (Seek Immediate Care / Call Emergency Services)",
    tierUrgent: "⚠️ Urgent (See a Doctor Promptly)",
    tierRoutine: "🗓️ Routine (Book a Regular Doctor Visit)",
    tierSelfCare: "🏡 Home Care (Rest & Monitor at Home)",

    // Common
    liveSyncActive: "Live Clinic Sync",
    confidentialNotice: "Saved on this device • Sent over HTTPS",
    emergencyDisclaimer:
      "If you have severe chest pain, trouble breathing, sudden weakness or numbness, contact your local emergency services or go to the nearest emergency room immediately.",
    persistentEmergencyNotice:
      "If you think this is an emergency, contact your local emergency services.",
    // TODO: CLINICAL REVIEW REQUIRED — No-match is not safety persistent advisory
    noMatchSafetyNotice:
      "No warning was detected, but this tool cannot rule out an emergency. If you are worried, contact your local emergency services or a doctor.",
    footerRights: "ManoMed AI. All rights reserved. Built to guide and support your health decisions.",
  },

  ar: {
    // Navigation
    brandName: "مانوميد للذكاء الطبي",
    navHome: "الرئيسية",
    navTriage: "فحص الأعراض",
    navLabs: "تحاليل الدم",
    navImaging: "الأشعة والفحوصات",
    navStation: "لوحة الطبيب",
    navHistory: "سجل زياراتي",
    navAbout: "عن التطبيق",
    navContact: "تواصل معنا",
    navEmergency: "طوارئ الإسعاف",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",

    // Hero
    heroBadge: "دليلك الصحي الذكي وبسيط الفهم",
    heroTitle: "إجابات طبية واضحة ومطمئنة بلغة يفهمها الجميع.",
    heroSubtitle:
      "مصمم ببساطة تامة ليفهمه أي شخص في العائلة دون أي قلق أو تعقيد، وبترتيب واضح ومفيد لطبيبك عند زيارة العيادة.",
    btnStartTriage: "ابدأ فحص الأعراض",
    btnOpenStation: "لوحة الطبيب والعيادة",
    btnExploreLabs: "فهم تحاليل الدم",
    btnExploreImaging: "فحص صور الأشعة",

    // Pillars
    pillarsHeading: "كيف يساعدك مانوميد؟",
    pillarsSubheading: "ثلاث أدوات بسيطة وسريعة لتفهم حالتك وتعرف الخطوة المناسبة التالية.",
    pillarTriageTitle: "فاحص الأعراض البسيط",
    pillarTriageDesc:
      "أسئلة هادئة وسهلة تساعدك على تحديد سبب انزعاجك ومعرفة ما إذا كنت بحاجة لزيارة الطبيب.",
    pillarLabsTitle: "مترجم تحاليل الدم",
    pillarLabsDesc:
      "شرح فوري لنتائج الفحوصات بمؤشرات واضحة (طبيعي، مرتفع، منخفض) بعيداً عن الرموز المعقدة.",
    pillarImagingTitle: "مساعد فحص الأشعة",
    pillarImagingDesc:
      "عرض صور الأشعة للصدر والعظام مع أدوات تكبير وإضاءة سهلة الاستخدام.",

    // Dual Audience
    dualHeading: "بسيط لك، ومفيد لطبيبك",
    patientViewTitle: "لك ولعائلتك",
    patientViewDesc:
      "كلام يومي واضح، خطوات عملية مطمئنة، وقائمة أسئلة مفيدة تطرحها على طبيبك في العيادة.",
    doctorViewTitle: "للطبيب والممرض",
    doctorViewDesc:
      "ملخص زمني مرتب وواضح للأعراض وتصنيف دقيق يساعد الطبيب على فهم حالتك في ثوانٍ.",

    // Triage Tiers
    tierEmergency: "🚨 حالة طارئة (اطلب الرعاية الفورية أو اتصل بالإسعاف)",
    tierUrgent: "⚠️ حالة عاجلة (راجع الطبيب على الفور)",
    tierRoutine: "🗓️ موعد عادي (احجز موعداً عادياً في العيادة)",
    tierSelfCare: "🏡 رعاية منزلية (راحة ومتابعة بسيطة في البيت)",

    // Common
    liveSyncActive: "مزامنة مباشرة مع العيادة",
    confidentialNotice: "محفوظ على هذا الجهاز • يتم الإرسال عبر HTTPS",
    emergencyDisclaimer:
      "إذا كنت تشعر بألم شديد في الصدر، أو صعوبة في التنفس، أو خدر مفاجئ، اتصل بخدمات الإسعاف والطوارئ المحلية فوراً.",
    persistentEmergencyNotice:
      "إذا كنت تعتقد أن هذه حالة طارئة، يرجى التواصل مع خدمات الإسعاف والطوارئ المحلية فوراً.",
    // TODO: CLINICAL REVIEW REQUIRED — No-match is not safety persistent advisory
    noMatchSafetyNotice:
      "لم يتم اكتشاف أي علامة تحذيرية، لكن هذه الأداة لا يمكنها استبعاد وجود حالة طوارئ. إذا كنت قلقاً، فاتصل بخدمات الطوارئ المحلية أو بطبيبك فوراً.",
    footerRights: "مانوميد للذكاء الطبي. جميع الحقوق محفوظة. لمساعدتك على اتخاذ قرارات صحية أفضل.",
  },

  es: {
    // Navigation
    brandName: "ManoMed AI",
    navHome: "Inicio",
    navTriage: "Revisar Síntomas",
    navLabs: "Análisis de Sangre",
    navImaging: "Radiografías",
    navStation: "Panel Médico",
    navHistory: "Mis Consultas",
    navAbout: "Acerca de Nosotros",
    navContact: "Contacto y Ayuda",
    navEmergency: "Servicios de Emergencia",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",

    // Hero
    heroBadge: "Guía de Salud y Síntomas Sencilla",
    heroTitle: "Respuestas médicas claras en un lenguaje que todos entienden.",
    heroSubtitle:
      "Tan fácil que cualquiera en casa puede entenderlo sin estrés ni dudas, y con el detalle necesario para mostrarle a tu médico.",
    btnStartTriage: "Comprobar mis Síntomas",
    btnOpenStation: "Panel Médico y Clínica",
    btnExploreLabs: "Entender mis Análisis",
    btnExploreImaging: "Revisar Radiografías",

    // Pillars
    pillarsHeading: "¿Cómo te ayuda ManoMed?",
    pillarsSubheading: "Tres herramientas sencillas para entender qué sientes y saber qué hacer a continuación.",
    pillarTriageTitle: "Comprobador de Síntomas",
    pillarTriageDesc:
      "Una guía tranquila y sencilla que te ayuda a saber qué te pasa y si necesitas ver a un médico.",
    pillarLabsTitle: "Explicador de Análisis de Sangre",
    pillarLabsDesc:
      "Entiende tus resultados fácilmente con etiquetas de Normal, Alto o Bajo sin números complicados.",
    pillarImagingTitle: "Visor de Radiografías",
    pillarImagingDesc:
      "Observa radiografías de tórax o huesos con herramientas sencillas de brillo y zoom.",

    // Dual Audience
    dualHeading: "Claro para ti, útil para tu médico",
    patientViewTitle: "Para ti y tu familia",
    patientViewDesc:
      "Palabras de todos los días, pasos tranquilos a seguir y preguntas útiles para hacerle a tu médico.",
    doctorViewTitle: "Para tu médico o enfermero",
    doctorViewDesc:
      "Un resumen ordenado con la cronología de tus síntomas para que el médico lo entienda en segundos.",

    // Triage Tiers
    tierEmergency: "🚨 Emergencia (Busca atención inmediata / Llama a emergencias)",
    tierUrgent: "⚠️ Urgente (Consulta médica a la brevedad)",
    tierRoutine: "🗓️ Rutina (Pide cita en tu centro de salud)",
    tierSelfCare: "🏡 Cuidados en Casa (Descanso y observación tranquila)",

    // Common
    liveSyncActive: "Sincronización Médica en Vivo",
    confidentialNotice: "Guardado en este dispositivo • Enviado mediante HTTPS",
    emergencyDisclaimer:
      "Si siente dolor fuerte en el pecho, dificultad para respirar o debilidad repentina, comuníquese con los servicios de emergencia locales de inmediato.",
    persistentEmergencyNotice:
      "Si cree que se trata de una emergencia, comuníquese con los servicios de emergencia locales.",
    // TODO: CLINICAL REVIEW REQUIRED — No-match is not safety persistent advisory
    noMatchSafetyNotice:
      "No se detectaron señales de alerta, pero esta herramienta no puede descartar una emergencia médica. Si está preocupado, comuníquese con los servicios de emergencia locales o con un médico.",
    footerRights: "ManoMed AI. Todos los derechos reservados. Diseñado para orientar tus decisiones de salud.",
  },

  zh: {
    // Navigation
    brandName: "ManoMed AI 智医助手",
    navHome: "首页",
    navTriage: "自测症状",
    navLabs: "化验单解读",
    navImaging: "X光影像",
    navStation: "医护工作台",
    navHistory: "健康记录",
    navAbout: "关于我们",
    navContact: "联系与求助",
    navEmergency: "急救求助",
    signIn: "登录",
    signOut: "退出",

    // Hero
    heroBadge: "简单好懂的智能健康助手",
    heroTitle: "用大白话讲清健康问题，让每个人都心里有底。",
    heroSubtitle:
      "界面简单明了，家里老人也能轻松看懂不慌张；同时整理清晰的重点，方便看病时直接给医生看。",
    btnStartTriage: "自测我的症状",
    btnOpenStation: "医护工作台",
    btnExploreLabs: "看懂化验单",
    btnExploreImaging: "查看X光影像",

    // Pillars
    pillarsHeading: "ManoMed 如何帮助您",
    pillarsSubheading: "三项实用小工具，帮您弄清身体不适，明确下一步该怎么做。",
    pillarTriageTitle: "症状自测小助手",
    pillarTriageDesc: "像和朋友聊天一样回答几个简单问题，快速了解可能的原因以及是否需要尽快就医。",
    pillarLabsTitle: "化验单大白话解读",
    pillarLabsDesc: "轻松看懂血常规等化验单的高低含义，不用再对着复杂的医学缩写发愁。",
    pillarImagingTitle: "X光影像查看器",
    pillarImagingDesc: "提供简单的放大与明暗调节，辅助查看骨骼或胸部影像。",

    // Dual Audience
    dualHeading: "患者看得懂，医生用得上",
    patientViewTitle: "给您和家人",
    patientViewDesc: "通俗易懂的大白话，安心实在的就诊建议，以及去医院前可以问医生的关键问题。",
    doctorViewTitle: "给接诊医生和护士",
    doctorViewDesc: "整理清晰的症状时间线，帮助医生在接诊时几十秒内快速掌握核心病情。",

    // Triage Tiers
    tierEmergency: "🚨 紧急情况（立即就医 / 呼叫当地急救电话）",
    tierUrgent: "⚠️ 尽快就诊（建议尽快看医生）",
    tierRoutine: "🗓️ 普通门诊（按常规预约普通门诊即可）",
    tierSelfCare: "🏡 居家休养（注意休息并留意身体变化）",

    // Common
    liveSyncActive: "诊区实时同步中",
    confidentialNotice: "保存在此设备上 • 通过 HTTPS 加密传输",
    emergencyDisclaimer: "如果您出现剧烈胸痛、呼吸急促、意识模糊或突发身体麻木，请立刻联系当地急救服务或前往最近的急诊室。",
    persistentEmergencyNotice: "如果您认为这是紧急情况，请立即联系当地急救服务。",
    // TODO: CLINICAL REVIEW REQUIRED — No-match is not safety persistent advisory
    noMatchSafetyNotice:
      "未检测到紧急警告，但本工具无法排除急症可能。如果您感到担忧，请立即联系当地急救服务或医生。",
    footerRights: "ManoMed AI 智医系统。版权所有。辅助健康决策，守护您的安心。",
  },

  fr: {
    // Navigation
    brandName: "ManoMed AI",
    navHome: "Accueil",
    navTriage: "Vérifier mes Symptômes",
    navLabs: "Prises de Sang",
    navImaging: "Radiographies",
    navStation: "Poste Médical",
    navHistory: "Mes Bilans",
    navAbout: "À Propos",
    navContact: "Aide & Contact",
    navEmergency: "Services d'Urgence",
    signIn: "Connexion",
    signOut: "Déconnexion",

    // Hero
    heroBadge: "Guide de Santé et Symptômes Simple",
    heroTitle: "Des réponses médicales claires, dans un langage simple pour tous.",
    heroSubtitle:
      "Facile à comprendre sans stress pour toute la famille, et suffisamment clair et détaillé pour aider votre médecin.",
    btnStartTriage: "Vérifier mes Symptômes",
    btnOpenStation: "Poste Médical & Clinique",
    btnExploreLabs: "Comprendre mes Analyses",
    btnExploreImaging: "Consulter les Radiographies",

    // Pillars
    pillarsHeading: "Comment ManoMed vous aide",
    pillarsSubheading: "Trois outils simples pour comprendre ce que vous ressentez et savoir quoi faire.",
    pillarTriageTitle: "Vérificateur de Symptômes",
    pillarTriageDesc:
      "Un guide pas à pas bienveillant pour identifier vos symptômes et savoir quand consulter un médecin.",
    pillarLabsTitle: "Explicateur d'Analyses de Sang",
    pillarLabsDesc:
      "Comprenez facilement vos prises de sang avec des repères clairs Normal, Haut ou Bas sans jargon obscur.",
    pillarImagingTitle: "Visionneuse de Radiographies",
    pillarImagingDesc:
      "Affichez vos radios osseuses et thoraciques avec des réglages simples de zoom et de contraste.",

    // Dual Audience
    dualHeading: "Clair pour vous, utile pour votre médecin",
    patientViewTitle: "Pour vous et votre famille",
    patientViewDesc:
      "Des mots simples de tous les jours, des conseils rassurants et des questions utiles à poser à votre médecin.",
    doctorViewTitle: "Pour votre médecin ou soignant",
    doctorViewDesc:
      "Un résumé clair et chronologique de vos symptômes, prêt à être lu en quelques secondes par le soignant.",

    // Triage Tiers
    tierEmergency: "🚨 Urgence Immédiate (Consultez Immédiatement / Appelez les Urgences)",
    tierUrgent: "⚠️ Consultation Rapide (Consultez rapidement un médecin)",
    tierRoutine: "🗓️ Consultation Ordinaire (Prenez un rendez-vous classique)",
    tierSelfCare: "🏡 Soins à la Maison (Repos et surveillance tranquille)",

    // Common
    liveSyncActive: "Synchronisation en Direct",
    confidentialNotice: "Enregistré sur cet appareil • Envoyé via HTTPS",
    emergencyDisclaimer:
      "En cas de douleur vive dans la poitrine, détresse respiratoire ou faiblesse soudaine, contactez immédiatement vos services d'urgence locaux ou rendez-vous aux urgences.",
    persistentEmergencyNotice:
      "Si vous pensez qu'il s'agit d'une urgence, contactez vos services d'urgence locaux.",
    // TODO: CLINICAL REVIEW REQUIRED — No-match is not safety persistent advisory
    noMatchSafetyNotice:
      "Aucun signal d'alerte n'a été détecté, mais cet outil ne peut pas exclure une urgence médicale. Si vous êtes inquiet, contactez vos services d'urgence locaux ou un médecin.",
    footerRights: "ManoMed AI. Tous droits réservés. Créé pour vous guider en toute confiance.",
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
