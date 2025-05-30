// Footer.tsx
import React from "react";
import "./Footer.css"; // Asegúrate de crear o ajustar este archivo CSS
import { useLanguage } from "./LanguageContext"; // Ajusta la ruta a tu LanguageContext
import type { LanguageCode } from "./LanguageContext";

// --- DEFINICIONES AL NIVEL SUPERIOR DEL MÓDULO ---

interface Language {
  code: LanguageCode;
  label: string;
}

interface FooterLink {
  id: string;
  translationKey: string;
  href: string;
  external?: boolean;
  // Opcional: podrías añadir un icono aquí si quieres mostrar iconos SVG
  // icon?: React.ReactNode;
}

const footerStaticTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  copyright: {
    ES: "© {year} {brandName}. Todos los derechos reservados.",
    EN: "© {year} {brandName}. All rights reserved.",
    DE: "© {year} {brandName}. Alle Rechte vorbehalten.",
  },
  privacyPolicy: {
    ES: "Política de Privacidad",
    EN: "Privacy Policy",
    DE: "Datenschutz",
  },
  termsOfService: {
    ES: "Términos de Servicio",
    EN: "Terms of Service",
    DE: "Nutzungsbedingungen",
  },
  contactFooter: { ES: "Contacto", EN: "Contact", DE: "Kontakt" },
  // Enlaces específicos para desarrolladores
  github: { ES: "GitHub", EN: "GitHub", DE: "GitHub" },
  linkedIn: { ES: "LinkedIn", EN: "LinkedIn", DE: "LinkedIn" },
  // Podrías añadir más, como Twitter/X, portafolio personal si es distinto al blog, etc.
  // twitter: { ES: "Twitter", EN: "Twitter", DE: "Twitter" },
  // sourceCode: { ES: "Código Fuente del Blog", EN: "Blog Source Code", DE: "Blog Quellcode"},
};

const getFooterStaticLabel = (
  key: string,
  lang: LanguageCode,
  replacements?: Record<string, string | number>
): string => {
  let label =
    footerStaticTranslations[key]?.[lang] ||
    footerStaticTranslations[key]?.["ES"] || // Fallback a Español si no existe la traducción específica
    key; // Fallback a la clave si no hay traducción en ES
  if (replacements) {
    Object.keys(replacements).forEach((placeholder) => {
      label = label.replace(
        `{${placeholder}}`,
        String(replacements[placeholder])
      );
    });
  }
  return label;
};

// --- COMPONENTE Footer ---
const Footer = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  // Este es el nombre que aparecerá en el copyright.
  // Podrías obtenerlo de una variable de entorno o configuración.
  // La imagen muestra "The Blog", así que lo mantenemos.
  const brandName = "The Blog";

  // Podrías considerar obtener tu nombre de usuario de GitHub/LinkedIn de una config también.
  const GITHUB_USERNAME = "tu-usuario-github"; // ¡REEMPLAZA ESTO!
  const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/tu-perfil-linkedin"; // ¡REEMPLAZA ESTO!

  const footerLinks: FooterLink[] = React.useMemo(
    () => [
      {
        id: "github",
        translationKey: "github",
        href: `https://github.com/${GITHUB_USERNAME}`,
        external: true,
      },
      {
        id: "linkedin",
        translationKey: "linkedIn",
        href: LINKEDIN_PROFILE_URL,
        external: true,
      },
      // Los enlaces que ya tenías
      {
        id: "privacy",
        translationKey: "privacyPolicy",
        href: "/privacy-policy", // Asegúrate que estas rutas existan en tu app
      },
      {
        id: "terms",
        translationKey: "termsOfService",
        href: "/terms-of-service", // Asegúrate que estas rutas existan en tu app
      },
      {
        id: "contact",
        translationKey: "contactFooter",
        href: "/contact-page", // O tu ruta de contacto preferida
      },
      // Ejemplo si quisieras enlazar al código fuente de tu blog:
      // {
      //   id: "source",
      //   translationKey: "sourceCode",
      //   href: "https://github.com/tu-usuario-github/el-repositorio-de-tu-blog",
      //   external: true,
      // },
    ],
    [GITHUB_USERNAME, LINKEDIN_PROFILE_URL] // Dependencias si usas variables
  );

  const languages: Language[] = [
    { code: "ES", label: "Español" },
    { code: "EN", label: "English" },
    { code: "DE", label: "Deutsch" },
  ];

  const handleLanguageChange = (langCode: LanguageCode) => {
    setCurrentLanguage(langCode);
  };

  return (
    <footer className="blog-footer">
      <div className="footer-content-wrapper">
        {/* Sección de Copyright */}
        <div className="footer-section footer-copyright">
          <p>
            {getFooterStaticLabel("copyright", currentLanguage, {
              year: currentYear,
              brandName: brandName,
            })}
          </p>
        </div>

        {/* Sección de Enlaces (incluye ahora los sociales/profesionales) */}
        {footerLinks.length > 0 && (
          <div className="footer-section footer-links">
            <ul className="footer-nav-items">
              {footerLinks.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {/* Aquí podrías renderizar item.icon si decides usar iconos SVG */}
                    {getFooterStaticLabel(item.translationKey, currentLanguage)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* La sección de selector de idioma se mantiene igual */}
        <div className="footer-section footer-language-switcher">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={currentLanguage === lang.code ? "active" : ""}
              aria-label={
                getFooterStaticLabel(
                  "changeLanguageTo", // Necesitarías añadir esta clave a tus traducciones
                  currentLanguage,
                  { language: lang.label }
                ) || `Switch to ${lang.label}`
              } // Fallback
            >
              {lang.code.toUpperCase()}{" "}
              {/* Muestra el código en mayúsculas como en la imagen */}
            </button>
          ))}
        </div>
      </div>
      {/* Sugerencia para desarrolladores: "Built with..." o "Hecho con..." */}
      {/* <div className="footer-built-with">
        <p>
          {currentLanguage === "ES" ? "Hecho con " : "Built with "}
          <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a>
          {" & "}
          <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a>
          . {/* Añade las tecnologías que uses */}
      {/* </p>
      </div> */}
    </footer>
  );
};

export default Footer;
