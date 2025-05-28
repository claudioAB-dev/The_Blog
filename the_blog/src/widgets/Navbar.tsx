// En BlogNavbar.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { FormEvent } from "react";
import "./Navbar.css"; // Tu CSS del Navbar
import { useLanguage } from "../widgets/LanguageContext"; // Ajusta la ruta a tu LanguageContext
import type { LanguageCode } from "../widgets/LanguageContext";
import ContactModal from "../widgets/ContactModal"; // Ajusta la ruta a tu ContactModal

// --- DEFINICIONES AL NIVEL SUPERIOR DEL MÓDULO ---

// Icono de Lupa
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Icono de Cerrar (X)
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Interfaces y Tipos
interface Language {
  code: LanguageCode;
  label: string;
}
interface Categorias {
  id: number;
  nombre_es: string;
  nombre_en: string;
  nombre_de: string;
  slug: string;
}
type ApiResponse = Categorias[];

// Funciones Auxiliares de Traducción y Datos
const getCategoryNameByLanguage = (
  category: Categorias,
  lang: LanguageCode
): string => {
  switch (lang) {
    case "EN":
      return category.nombre_en;
    case "DE":
      return category.nombre_de;
    case "ES":
    default:
      return category.nombre_es;
  }
};

const staticTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  home: { ES: "Portafolio", EN: "Portfolio", DE: "Portfolio" },
  contact: { ES: "Contacto", EN: "Contact", DE: "Kontakt" },
  brand: { ES: "The Blog", EN: "The Blog", DE: "The Blog" },
  searchPlaceholderDesktop: {
    ES: "Buscar en el blog...",
    EN: "Search the blog...",
    DE: "Blog durchsuchen...",
  },
  searchPlaceholderMobile: {
    ES: "Buscar...",
    EN: "Search...",
    DE: "Suchen...",
  },
  closeSearch: {
    ES: "Cerrar búsqueda",
    EN: "Close search",
    DE: "Suche schließen",
  },
  openSearch: { ES: "Abrir búsqueda", EN: "Open search", DE: "Suche öffnen" },
  toggleNavigation: {
    ES: "Alternar navegación",
    EN: "Toggle navigation",
    DE: "Navigation umschalten",
  },
  searchMobileLabel: {
    ES: "Buscar en móvil",
    EN: "Search on mobile",
    DE: "Suche mobil",
  },
  languageMobilePrompt: { ES: "Idioma:", EN: "Language:", DE: "Sprache:" },
  loading: { ES: "Cargando...", EN: "Loading...", DE: "Laden..." },
  errorLoading: {
    ES: "Error al cargar datos:",
    EN: "Error loading data:",
    DE: "Fehler beim Laden der Daten:",
  },
  noCategoriesFound: {
    ES: "No se encontraron categorías.",
    EN: "No categories found.",
    DE: "Keine Kategorien gefunden.",
  },
};

const getStaticLabel = (key: string, lang: LanguageCode): string => {
  return (
    staticTranslations[key]?.[lang] || staticTranslations[key]?.["ES"] || key
  );
};

// --- COMPONENTE BlogNavbar ---
const BlogNavbar = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isNavMenuExpanded, setIsNavMenuExpanded] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [datos, setDatos] = useState<ApiResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar datos de categorías
  useEffect(() => {
    const urlBackend = "http://127.0.0.1:5000/categorias"; // Considera poner esto en una variable de entorno
    const fetchData = async (): Promise<void> => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(urlBackend);
        if (!respuesta.ok) {
          throw new Error(`HTTP error! status: ${respuesta.status}`);
        }
        const json = (await respuesta.json()) as ApiResponse;
        setDatos(json);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Ocurrió un error desconocido al cargar categorías.");
        }
        setDatos(null);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // Efecto para el foco en el input de búsqueda
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Efecto para cerrar búsqueda al hacer clic fuera
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    },
    [setIsSearchExpanded] // La dependencia es estable
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // Items de navegación para escritorio
  const homeItemForDesktop = useMemo(
    () => ({
      id: "home",
      label: getStaticLabel("home", currentLanguage),
      href: "/",
    }),
    [currentLanguage]
  );

  const categoryNavLinks = useMemo(() => {
    if (cargando || error || !datos || datos.length === 0) {
      return [];
    }
    return datos.map((cat) => ({
      id: `cat-${cat.id}`,
      label: getCategoryNameByLanguage(cat, currentLanguage),
      href: `/categorias/${cat.slug}`,
    }));
  }, [datos, currentLanguage, cargando, error]);

  // Items de navegación para el menú móvil
  const navItemsForMobile = useMemo(() => {
    const staticHome = {
      id: "home",
      label: getStaticLabel("home", currentLanguage),
      href: "/",
      action: "link" as const,
    };
    const staticContactItem = {
      id: "contact",
      label: getStaticLabel("contact", currentLanguage),
      href: "#", // href no se usa realmente para el botón
      action: "button" as const,
    };

    if (cargando || error || !datos || datos.length === 0) {
      return [staticHome, staticContactItem];
    }

    return [
      staticHome,
      ...(datos?.map((cat) => ({
        id: `cat-${cat.id}`,
        label: getCategoryNameByLanguage(cat, currentLanguage),
        href: `/categorias/${cat.slug}`,
        action: "link" as const,
      })) || []),
      staticContactItem,
    ];
  }, [datos, currentLanguage, cargando, error]);

  // Manejadores de eventos
  const toggleContactModal = () => {
    setIsContactModalOpen(!isContactModalOpen);
    if (isNavMenuExpanded) {
      setIsNavMenuExpanded(false);
    }
  };

  const handleLanguageChange = (langCode: LanguageCode) => {
    setCurrentLanguage(langCode);
    // Cierra el menú móvil si está abierto al cambiar idioma desde ahí
    if (isNavMenuExpanded) {
      setIsNavMenuExpanded(false);
    }
  };

  const languages: Language[] = [
    { code: "ES", label: "Español" },
    { code: "EN", label: "English" },
    { code: "DE", label: "Deutsch" },
  ];

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  const handleMobileSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get("mobileSearch") as string;
    // console.log("Búsqueda móvil enviada:", searchQuery || "vacío");
    setIsSearchExpanded(false); // Cierra la interfaz de búsqueda si está abierta
    setIsNavMenuExpanded(false); // Cierra el menú móvil
    // Aquí iría la lógica para procesar la búsqueda con searchQuery
  };

  // Retornos tempranos por estado de carga o error
  if (cargando) {
    // Podrías mostrar un esqueleto de Navbar o un loader más integrado
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        {getStaticLabel("loading", currentLanguage)}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        {getStaticLabel("errorLoading", currentLanguage)} {error}
      </div>
    );
  }

  // Si llegamos aquí, `datos` podría ser `null` (si hubo error no manejado por el bloque anterior) o un array.
  // `categoryNavLinks` y `navItemsForMobile` ya manejan el caso de `datos` vacío o `null`.

  return (
    <>
      <nav className="blog-navbar">
        {/* IZQUIERDA: Brand + Home ("Portafolio") */}
        <div className="blog-navbar-group blog-navbar-group-left">
          <a href="/" className="blog-navbar-brand">
            {getStaticLabel("brand", currentLanguage)}
          </a>
          <ul className="blog-navbar-nav-items">
            <li key={homeItemForDesktop.id}>
              <a href={homeItemForDesktop.href}>{homeItemForDesktop.label}</a>
            </li>
          </ul>
        </div>

        {/* CENTRO: Categorías */}
        {categoryNavLinks.length > 0 && (
          <div className="blog-navbar-group blog-navbar-group-center">
            <ul className="blog-navbar-nav-items">
              {categoryNavLinks.map((item) => (
                <li key={item.id}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Mensaje si no hay categorías y no se está cargando/error */}
        {/* Esto es opcional, ya que el Navbar se renderiza igualmente */}
        {/* {!cargando && !error && datos && datos.length === 0 && (
          <div className="blog-navbar-group blog-navbar-group-center">
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{getStaticLabel("noCategoriesFound", currentLanguage)}</p>
          </div>
        )} */}

        {/* DERECHA: Contacto + Herramientas (Buscador, Idioma) */}
        <div className="blog-navbar-group blog-navbar-group-right">
          <ul className="blog-navbar-nav-items blog-navbar-nav-items-right-links">
            <li>
              <button
                type="button"
                className="nav-link-button"
                onClick={toggleContactModal}
              >
                {getStaticLabel("contact", currentLanguage)}
              </button>
            </li>
          </ul>
          <div className="blog-navbar-tools">
            <div
              className={`expandable-search ${
                isSearchExpanded ? "expanded" : ""
              }`}
              ref={searchContainerRef}
            >
              <button
                type="button"
                className="search-toggle-btn"
                onClick={toggleSearch}
                aria-label={
                  isSearchExpanded
                    ? getStaticLabel("closeSearch", currentLanguage)
                    : getStaticLabel("openSearch", currentLanguage)
                }
                aria-expanded={isSearchExpanded}
              >
                {isSearchExpanded ? <CloseIcon /> : <SearchIcon />}
              </button>
              <input
                ref={searchInputRef}
                type="search"
                placeholder={getStaticLabel(
                  "searchPlaceholderDesktop",
                  currentLanguage
                )}
                className="search-input"
                aria-hidden={!isSearchExpanded}
                // Aquí podrías añadir onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
            </div>
            <div className="language-switcher">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={currentLanguage === lang.code ? "active" : ""}
                  aria-label={`Cambiar a ${lang.label}`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TOGGLER PARA MÓVIL */}
        <button
          type="button"
          className="blog-navbar-toggler"
          onClick={() => setIsNavMenuExpanded(!isNavMenuExpanded)}
          aria-expanded={isNavMenuExpanded}
          aria-label={getStaticLabel("toggleNavigation", currentLanguage)}
          aria-controls="mobileNavMenu"
        >
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
        </button>

        {/* MENÚ COLAPSABLE MÓVIL */}
        <div
          id="mobileNavMenu"
          className={
            isNavMenuExpanded
              ? "blog-navbar-collapse expanded"
              : "blog-navbar-collapse"
          }
        >
          <form
            className="blog-navbar-search-mobile"
            onSubmit={handleMobileSearchSubmit}
          >
            <input
              type="search"
              name="mobileSearch" // Importante para FormData
              placeholder={getStaticLabel(
                "searchPlaceholderMobile",
                currentLanguage
              )}
              aria-label={getStaticLabel("searchMobileLabel", currentLanguage)}
            />
            <button
              type="submit"
              aria-label={getStaticLabel("openSearch", currentLanguage)}
            >
              <SearchIcon />
            </button>
          </form>

          <ul className="blog-navbar-nav-items-mobile">
            {navItemsForMobile.map((item) => (
              <li key={item.id}>
                {item.action === "button" && item.id === "contact" ? (
                  <button
                    type="button"
                    className="nav-link-button-mobile"
                    onClick={toggleContactModal}
                  >
                    {item.label}
                  </button>
                ) : (
                  // Aseguramos que item.href exista para los 'link'
                  <a
                    href={item.href || "#"}
                    onClick={() => setIsNavMenuExpanded(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="language-switcher-mobile">
            <p>{getStaticLabel("languageMobilePrompt", currentLanguage)}</p>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)} // handleLanguageChange ya cierra el menú
                className={currentLanguage === lang.code ? "active" : ""}
                aria-label={`Cambiar a ${lang.label}`}
              >
                {lang.code}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <ContactModal isOpen={isContactModalOpen} onClose={toggleContactModal} />
    </>
  );
};

export default BlogNavbar;
