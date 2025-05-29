// src/components/Entradas/EntradaDetalle.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../widgets/LanguageContext";
import type { LanguageCode } from "../widgets/LanguageContext";
import "./EntradaDetalle.css";

// ... (Tu interfaz BlogPost y funciones helper getPostTranslatedField, DetailTranslations, getDetailTranslation)
interface BlogPost {
  id: number;
  autor_id: number;
  categoria_id: number;
  slug: string;
  imagen_destacada: string;
  estado: string;
  fecha_publicacion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  titulo_es: string;
  resumen_es: string;
  contenido_es: string;
  titulo_en?: string;
  resumen_en?: string;
  contenido_en?: string;
  titulo_de?: string;
  resumen_de?: string;
  contenido_de?: string;
}

const getPostTranslatedField = (
  post: BlogPost,
  fieldName: "titulo" | "resumen" | "contenido",
  lang: LanguageCode
): string => {
  const targetLangField =
    `${fieldName}_${lang.toLowerCase()}` as keyof BlogPost;
  const fallbackEsField = `${fieldName}_es` as keyof BlogPost;
  const fieldValue =
    (post[targetLangField] as string) || (post[fallbackEsField] as string);
  return fieldValue || `[${fieldName} no disponible en ${lang} o ES]`;
};

const DetailTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  authorLabel: { ES: "Autor ID", EN: "Author ID", DE: "Autor ID" },
  categoryLabel: { ES: "Categoría ID", EN: "Category ID", DE: "Kategorie ID" },
  publishedDateLabel: {
    ES: "Publicado el",
    EN: "Published on",
    DE: "Veröffentlicht am",
  },
};

const getDetailTranslation = (key: string, lang: LanguageCode): string => {
  return (
    DetailTranslations[key]?.[lang] || DetailTranslations[key]?.["ES"] || key
  );
};

const EntradaDetalle: React.FC = () => {
  // --- SECCIÓN DE HOOKS (Todos deben estar aquí arriba) ---
  const { slug } = useParams<{ slug: string }>(); // Hook 1
  const { currentLanguage } = useLanguage(); // Hook 2
  const [post, setPost] = useState<BlogPost | null>(null); // Hook 3
  const [cargando, setCargando] = useState<boolean>(true); // Hook 4
  const [error, setError] = useState<string | null>(null); // Hook 5

  const API_BASE_URL = "http://127.0.0.1:5000/entradas"; // Esto no es un Hook

  useEffect(() => {
    // Hook 6
    if (!slug) {
      setError("No se proporcionó un slug para la entrada.");
      setCargando(false);
      return;
    }
    const fetchPost = async () => {
      // ... (lógica de fetchPost como en tu código original/anterior solución)
      setCargando(true);
      setError(null);
      setPost(null);
      try {
        const response = await fetch(`${API_BASE_URL}?slug=${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              `Entrada con slug "${slug}" no encontrada (Error 404).`
            );
          }
          throw new Error(
            `Error HTTP: ${response.status} - No se pudo cargar la entrada.`
          );
        }
        const jsonResponse = await response.json();
        const entryData = Array.isArray(jsonResponse)
          ? jsonResponse[0]
          : jsonResponse;
        if (!entryData) {
          throw new Error(
            `Entrada con slug "${slug}" no fue encontrada en la respuesta.`
          );
        }
        setPost(entryData as BlogPost);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Ocurrió un error desconocido al cargar la entrada.";
        setError(errorMessage);
        console.error("Error al cargar la entrada:", e);
        setPost(null);
      } finally {
        setCargando(false);
      }
    };
    fetchPost();
  }, [slug]); // Considera si currentLanguage es necesario aquí para el fetch

  const pageTitle = useMemo(() => {
    // Hook 7
    if (cargando) return "Cargando...";
    if (error) return "Error al cargar";
    if (!post) return "Entrada no encontrada";
    return getPostTranslatedField(post, "titulo", currentLanguage);
  }, [post, currentLanguage, cargando, error]);

  useEffect(() => {
    // Hook 8
    document.title = pageTitle;
  }, [pageTitle]);

  // Este es el Hook que probablemente está causando problemas si no está aquí:
  const fechaPublicacionFormateada = useMemo(() => {
    // Hook 9
    if (!post || !post.fecha_publicacion) {
      return "Fecha desconocida";
    }
    try {
      return new Date(post.fecha_publicacion).toLocaleDateString(
        currentLanguage.toLowerCase(),
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch (e) {
      console.error("Error al formatear la fecha:", e);
      return post.fecha_publicacion;
    }
  }, [post, currentLanguage]);
  // --- FIN DE LA SECCIÓN DE HOOKS ---

  // --- LÓGICA DE RETORNO CONDICIONAL (Después de TODOS los Hooks) ---
  if (cargando) {
    return <div className="entrada-detalle-status">Cargando entrada... ⏳</div>;
  }

  if (error) {
    return (
      <div className="entrada-detalle-status entrada-detalle-error">
        Error: {error} 😞
      </div>
    );
  }

  if (!post) {
    return (
      <div className="entrada-detalle-status">
        La entrada solicitada no fue encontrada o no hay datos disponibles. 🤷‍♂️
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL (Cuando post existe y no hay errores/carga) ---
  const titulo = getPostTranslatedField(post, "titulo", currentLanguage);
  const contenido = getPostTranslatedField(post, "contenido", currentLanguage);

  return (
    <div className="entrada-detalle-container">
      <article className="entrada-detalle-contenido">
        <header className="entrada-detalle-header">
          <h1 className="entrada-detalle-titulo">{titulo}</h1>
          {post.imagen_destacada && (
            <img
              src={post.imagen_destacada}
              alt={`Imagen destacada para ${titulo}`}
              className="entrada-detalle-imagen"
            />
          )}
          <div className="entrada-detalle-meta">
            <p className="meta-item">
              <span className="meta-label">
                {getDetailTranslation("publishedDateLabel", currentLanguage)}:
              </span>{" "}
              <time dateTime={post.fecha_publicacion}>
                {fechaPublicacionFormateada}
              </time>
            </p>
            <p className="meta-item">
              <span className="meta-label">
                {getDetailTranslation("authorLabel", currentLanguage)}:
              </span>{" "}
              {post.autor_id}
            </p>
            <p className="meta-item">
              <span className="meta-label">
                {getDetailTranslation("categoryLabel", currentLanguage)}:
              </span>{" "}
              {post.categoria_id}
            </p>
          </div>
        </header>
        <div
          className="entrada-detalle-cuerpo"
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      </article>
    </div>
  );
};

export default EntradaDetalle;
