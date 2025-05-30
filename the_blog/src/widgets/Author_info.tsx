// En PageWithAuthor.tsx
import React, { useMemo } from "react"; // Se quita useState
import "./author_info.css";
import authorFoto from "../assets/author_foto.png";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailIcon from "@mui/icons-material/Mail";
import { useLanguage } from "../widgets/LanguageContext"; // Ajusta la ruta
import type { LanguageCode } from "../widgets/LanguageContext";
import { Mail } from "@mui/icons-material";

// El tipo LanguageCode se importa desde LanguageContext
// Las traducciones y la función getAuthorWidgetLabel pueden permanecer aquí o moverse
// a un archivo i18n compartido si crece la aplicación.

const authorWidgetTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  authorTitle: {
    ES: "Desarrollador de Software",
    EN: "Software Developer",
    DE: "Softwareentwickler",
  },
  authorBio: {
    ES: "Desarrollador de software con experiencia en la creación de aplicaciones web utilizando tecnologías como React, Node.js, Python, y bases de datos SQL/NoSQL. \n Me apasiona resolver problemas complejos y aprender continuamente, aportando soluciones eficientes y colaborando activamente en equipos de desarrollo.",
    EN: "Software developer experienced in creating web applications using technologies like React, Node.js, Python, and SQL/NoSQL databases.\n I am passionate about solving complex problems and continuous learning, providing efficient solutions and actively collaborating in development teams.",
    DE: "Softwareentwickler mit Erfahrung in der Erstellung von Webanwendungen unter Verwendung von Technologien wie React, Node.js, Python und SQL/NoSQL-Datenbanken. \nEs ist meine Leidenschaft, komplexe Probleme zu lösen und kontinuierlich zu lernen, effiziente Lösungen bereitzustellen und aktiv in Entwicklungsteams zusammenzuarbeiten.",
  },
  linkedInAriaLabelPattern: {
    ES: "Perfil de LinkedIn de {name}",
    EN: "{name}'s LinkedIn Profile",
    DE: "LinkedIn-Profil von {name}",
  },
  githubAriaLabelPattern: {
    ES: "Perfil de GitHub de {name}",
    EN: "{name}'s GitHub Profile",
    DE: "GitHub-Profil von {name}",
  },
  photoAltTextPrefix: {
    ES: "Foto de ",
    EN: "Photo of ",
    DE: "Foto von ",
  },
};

const getAuthorWidgetLabel = (
  key: string,
  lang: LanguageCode,
  name?: string
): string => {
  const translationTemplate =
    authorWidgetTranslations[key]?.[lang] ||
    authorWidgetTranslations[key]?.["ES"] ||
    key;

  if (key === "photoAltTextPrefix" && name) {
    return `${translationTemplate}${name}`;
  }
  if (
    (key === "linkedInAriaLabelPattern" || key === "githubAriaLabelPattern") &&
    name
  ) {
    return translationTemplate.replace("{name}", name);
  }
  return translationTemplate;
};

interface AuthorDisplayData {
  imageUrl: string;
  name: string;
  title: string;
  bio: string;
  photoAltText: string;
  socialLinks: Array<{
    platformName: string;
    url: string;
    ariaLabel: string;
    icon: React.ReactElement;
  }>;
}

const PageWithAuthor: React.FC = () => {
  const { currentLanguage } = useLanguage(); // Usar idioma del contexto

  const baseAuthorData = useMemo(
    () => ({
      imageUrl: authorFoto,
      name: "Claudio Ariza Balseca",
      linkedInUrl:
        "https://www.linkedin.com/in/claudio-ariza-balseca-865853226/",
      githubUrl: "https://github.com/claudioAB-dev",
    }),
    []
  );

  const authorDisplayData: AuthorDisplayData = useMemo(() => {
    return {
      imageUrl: baseAuthorData.imageUrl,
      name: baseAuthorData.name,
      title: getAuthorWidgetLabel("authorTitle", currentLanguage),
      bio: getAuthorWidgetLabel("authorBio", currentLanguage),
      photoAltText: getAuthorWidgetLabel(
        "photoAltTextPrefix",
        currentLanguage,
        baseAuthorData.name
      ),
      socialLinks: [
        {
          platformName: "LinkedIn",
          url: baseAuthorData.linkedInUrl,
          ariaLabel: getAuthorWidgetLabel(
            "linkedInAriaLabelPattern",
            currentLanguage,
            baseAuthorData.name
          ),
          icon: <LinkedInIcon sx={{ fontSize: 36 }} />, // Icono más grande
        },
        {
          platformName: "GitHub",
          url: baseAuthorData.githubUrl,
          ariaLabel: getAuthorWidgetLabel(
            "githubAriaLabelPattern",
            currentLanguage,
            baseAuthorData.name
          ),
          icon: <GitHubIcon sx={{ fontSize: 36 }} />, // Icono más grande
        },
      ],
    };
  }, [currentLanguage, baseAuthorData]);

  return (
    // Si este es solo el widget, el page-container podría ser parte del layout padre.
    // Por ahora, lo mantenemos según el código que pasaste originalmente.
    <div className="page-container-author-widget">
      {" "}
      {/* Clase diferente para evitar conflictos si page-container tiene estilos muy especificos de layout */}
      <aside className="author-profile-section">
        <div className="author-card">
          <img
            src={authorDisplayData.imageUrl}
            alt={authorDisplayData.photoAltText}
            className="author-image"
          />
          <h3 className="author-name">{authorDisplayData.name}</h3>
          <p className="author-title">{authorDisplayData.title}</p>
          <p className="author-bio">{authorDisplayData.bio}</p>
          <div className="author-social-links">
            {authorDisplayData.socialLinks.map((link) => (
              <a
                key={link.platformName}
                href={link.url}
                aria-label={link.ariaLabel}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platformName}
                className="author-social-link-item"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PageWithAuthor;
