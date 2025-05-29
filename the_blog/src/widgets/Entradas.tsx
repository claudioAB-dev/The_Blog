import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom"; // <--- IMPORTANTE: Para la navegación
import { useLanguage } from "../widgets/LanguageContext"; // Ajusta la ruta si es necesario
import type { LanguageCode } from "../widgets/LanguageContext"; // Ajusta la ruta si es necesario

import "./Entradas.css"; // Asegúrate que esta ruta sea correcta

// --- Definición de Traducciones Estáticas de la Página ---
const BlogTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  blogPageTitle: {
    ES: "Entradas del Blog",
    EN: "Blog Entries",
    DE: "Blog-Einträge",
  },
  blogPageDescription: {
    ES: "Explora las últimas entradas del blog.",
    EN: "Explore the latest blog entries.",
    DE: "Entdecken Sie die neuesten Blog-Einträge.",
  },
  noEntriesMessage: {
    ES: "No hay entradas disponibles en este momento.",
    EN: "No entries available at this time.",
    DE: "Derzeit sind keine Einträge verfügbar.",
  },
  loadingMessage: {
    ES: "Cargando entradas...",
    EN: "Loading entries...",
    DE: "Lade Einträge...",
  },
  readMore: {
    ES: "Leer más",
    EN: "Read more",
    DE: "Weiterlesen",
  },
};

// --- Función de Traducción (Estática) ---
const getTranslation = (
  key: string,
  lang: LanguageCode,
  interpolations?: Record<string, string | number>
): string => {
  const translationTemplate =
    BlogTranslations[key]?.[lang] || BlogTranslations[key]?.["ES"] || key;

  if (interpolations) {
    let result = translationTemplate;
    for (const placeholder in interpolations) {
      result = result.replace(
        new RegExp(`{${placeholder}}`, "g"),
        String(interpolations[placeholder])
      );
    }
    return result;
  }
  return translationTemplate;
};

// --- Interfaces ---
interface BlogPost {
  id: number;
  autor_id: number;
  categoria_id: number;
  slug: string; // Muy importante para la URL amigable
  imagen_destacada: string;
  estado: string;
  fecha_publicacion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Campos traducibles
  titulo_es: string;
  resumen_es: string;
  contenido_es: string; // El contenido completo se usará en EntradaDetalle.tsx
  titulo_en?: string;
  resumen_en?: string;
  contenido_en?: string;
  titulo_de?: string;
  resumen_de?: string;
  contenido_de?: string;
}

type ApiResponse = BlogPost[]; // Asumimos que la API devuelve un array de BlogPost

// --- Helper para obtener el campo traducido de una entrada ---
const getPostTranslatedField = (
  post: BlogPost,
  fieldName: "titulo" | "resumen" | "contenido", // Extendible si hay más campos
  lang: LanguageCode
): string => {
  const targetLangField =
    `${fieldName}_${lang.toLowerCase()}` as keyof BlogPost;
  const fallbackEsField = `${fieldName}_es` as keyof BlogPost;
  const fieldValue =
    (post[targetLangField] as string) || (post[fallbackEsField] as string);
  return fieldValue || `[${fieldName} no disponible en ${lang} o ES]`;
};

// --- Componente Entradas ---
const Entradas: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [blogPosts, setBlogPosts] = useState<BlogPost[] | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // URL del backend (Idealmente desde una variable de entorno)
  const API_URL = "http://127.0.0.1:5000/entradas";
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
          throw new Error(
            `Error HTTP: ${respuesta.status} ${respuesta.statusText}`
          );
        }
        const json = (await respuesta.json()) as ApiResponse;
        setBlogPosts(json);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Ocurrió un error desconocido al cargar las entradas.");
        }
        setBlogPosts(null);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [API_URL]); // Dependencia API_URL por si cambia

  // Textos de la página memoizados para eficiencia
  const pageTitle = useMemo(
    () => getTranslation("blogPageTitle", currentLanguage),
    [currentLanguage]
  );
  const pageDescription = useMemo(
    () => getTranslation("blogPageDescription", currentLanguage),
    [currentLanguage]
  );
  const noEntriesMessageText = useMemo(
    () => getTranslation("noEntriesMessage", currentLanguage),
    [currentLanguage]
  );
  const loadingMessageText = useMemo(
    () => getTranslation("loadingMessage", currentLanguage),
    [currentLanguage]
  );
  const readMoreText = useMemo(
    () => getTranslation("readMore", currentLanguage),
    [currentLanguage]
  );

  if (cargando) {
    return <div className="entradas-status">{loadingMessageText}</div>;
  }

  if (error) {
    return (
      <div className="entradas-status entradas-error">
        Error al cargar las entradas: {error}
      </div>
    );
  }

  return (
    <div className="entradas-page-container">
      <header className="entradas-header">
        <h1 className="entradas-main-title">{pageTitle}</h1>
        <p className="entradas-description">{pageDescription}</p>
      </header>

      {!blogPosts || blogPosts.length === 0 ? (
        <section className="entradas-list-section">
          <p className="entradas-no-entries">{noEntriesMessageText}</p>
        </section>
      ) : (
        <section className="entradas-list-section">
          {blogPosts.map((entry) => {
            const titulo = getPostTranslatedField(
              entry,
              "titulo",
              currentLanguage
            );
            const resumen = getPostTranslatedField(
              entry,
              "resumen",
              currentLanguage
            );

            return (
              <article key={entry.id} className="entrada-item">
                {entry.imagen_destacada && (
                  <Link
                    to={`/blog/${entry.slug}`}
                    className="entrada-imagen-link"
                  >
                    <img
                      src={entry.imagen_destacada}
                      alt={`Imagen para ${titulo}`}
                      className="entrada-imagen"
                    />
                  </Link>
                )}
                <div className="entrada-contenido">
                  <h2 className="entrada-titulo">
                    <Link to={`/blog/${entry.slug}`}>{titulo}</Link>
                  </h2>
                  <p className="entrada-meta">
                    <span>
                      Publicado:{" "}
                      {new Date(entry.fecha_publicacion).toLocaleDateString(
                        // Genera un locale string como 'es-ES', 'en-US', 'de-DE'
                        `${currentLanguage.toLowerCase()}-${currentLanguage.toUpperCase()}`
                      )}
                    </span>
                    {/* Aquí podrías añadir más metadatos, como el autor o categoría si los tuvieras */}
                  </p>
                  <p className="entrada-resumen">{resumen}</p>
                  <Link to={`/blog/${entry.slug}`} className="entrada-leer-mas">
                    {readMoreText}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default Entradas;
