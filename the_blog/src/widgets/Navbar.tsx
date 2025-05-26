import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { FormEvent } from "react";
import "./Navbar.css";

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

type LanguageCode = "ES" | "EN" | "DE";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

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
  home: { ES: "Inicio", EN: "Home", DE: "Startseite" },
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
  return staticTranslations[key]?.[lang] || key;
};

const BlogNavbar = () => {
  // --- 1. TODOS LOS HOOKS SE DECLARAN PRIMERO ---
  const [isNavMenuExpanded, setIsNavMenuExpanded] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("ES");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [datos, setDatos] = useState<ApiResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlBackend = "http://127.0.0.1:5000/categorias";
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
          setError("Ocurrió un error desconocido");
        }
        setDatos(null);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const navItems = useMemo(() => {
    const staticHome = {
      id: "home",
      label: getStaticLabel("home", currentLanguage),
      href: "/",
    };
    const staticContact = {
      id: "contact",
      label: getStaticLabel("contact", currentLanguage),
      href: "/contacto",
    };

    if (!datos || datos.length === 0) {
      // Si no hay datos o están vacíos
      return [staticHome, staticContact]; // Devuelve solo ítems estáticos
    }

    return [
      staticHome,
      ...datos.map((cat) => ({
        id: `cat-${cat.id}`,
        label: getCategoryNameByLanguage(cat, currentLanguage),
        href: `/categorias/${cat.slug}`,
      })),
      staticContact,
    ];
  }, [datos, currentLanguage]);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    },
    [setIsSearchExpanded] // setIsSearchExpanded es estable
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // --- 2. LÓGICA DE RETORNO TEMPRANO (DESPUÉS DE TODOS LOS HOOKS) ---
  if (cargando) {
    return <p>{getStaticLabel("loading", currentLanguage)}</p>;
  }

  if (error) {
    return (
      <p>
        {getStaticLabel("errorLoading", currentLanguage)} {error}
      </p>
    );
  }

  // Si no hay categorías dinámicas, podrías optar por mostrar un mensaje
  // o renderizar el Navbar solo con ítems estáticos.
  // Esta condición mantiene el comportamiento anterior de mostrar un mensaje.
  if (!datos || datos.length === 0) {
    // Podrías aquí decidir renderizar el navbar con navItems (que solo tendría estáticos)
    // o mostrar este mensaje. Para mantener la lógica anterior:
    return <p>{getStaticLabel("noCategoriesFound", currentLanguage)}</p>;
  }

  // --- 3. MANEJADORES DE EVENTOS Y OTRA LÓGICA PARA EL RENDERIZADO PRINCIPAL ---
  const handleLanguageChange = (langCode: LanguageCode) => {
    setCurrentLanguage(langCode);
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
    console.log("Búsqueda móvil enviada:", searchQuery || "vacío");
    // Implementar lógica de búsqueda aquí
    setIsSearchExpanded(false); // Opcional: cerrar búsqueda/menú
    setIsNavMenuExpanded(false);
  };

  // --- 4. RENDERIZADO PRINCIPAL DEL JSX ---
  return (
    <nav className="blog-navbar">
      <div className="blog-navbar-left-group">
        <a href="/" className="blog-navbar-brand">
          {getStaticLabel("brand", currentLanguage)}
        </a>
        <ul className="blog-navbar-nav-items">
          {navItems.map((item) => (
            <li key={item.id}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="blog-navbar-right-group">
        <div
          className={`expandable-search ${isSearchExpanded ? "expanded" : ""}`}
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
            name="mobileSearch"
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
          {navItems.map((item) => (
            <li key={item.id}>
              <a href={item.href} onClick={() => setIsNavMenuExpanded(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="language-switcher-mobile">
          <p>{getStaticLabel("languageMobilePrompt", currentLanguage)}</p>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                handleLanguageChange(lang.code);
                setIsNavMenuExpanded(false);
              }}
              className={currentLanguage === lang.code ? "active" : ""}
              aria-label={`Cambiar a ${lang.label}`}
            >
              {lang.code}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BlogNavbar;
