import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../widgets/LanguageContext"; // Asegúrate que la ruta sea correcta
import type { LanguageCode } from "../widgets/LanguageContext"; // Asegúrate que la ruta sea correcta
import "./EntradaDetalle.css"; // Asegúrate que la ruta sea correcta

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
  // --- SECCIÓN DE HOOKS ---
  const { slug } = useParams<{ slug: string }>();
  const { currentLanguage } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Definición de la URL base de la API. Puede estar en un archivo de configuración.
  const API_BASE_URL = "http://127.0.0.1:5000/entradas";

  useEffect(() => {
    if (!slug) {
      setError("No se proporcionó un slug para la entrada.");
      setCargando(false);
      return;
    }

    const fetchPostData = async () => {
      setCargando(true);
      setError(null);
      setPost(null); // Limpiar el post anterior mientras se carga el nuevo
      try {
        const response = await fetch(`${API_BASE_URL}?slug=${slug}`);

        // Intentar parsear el cuerpo de la respuesta como JSON.
        // Esto es útil incluso para errores, ya que el backend podría enviar detalles en JSON.
        let jsonResponse;
        try {
          jsonResponse = await response.json();
        } catch (parseError) {
          // Si el parseo falla (ej. respuesta no es JSON válido), y la respuesta no fue OK.
          if (!response.ok) {
            throw new Error(
              `Error HTTP: ${response.status} - Respuesta no es JSON válido.`
            );
          }
          // Si la respuesta fue OK pero no es JSON, es un problema inesperado.
          throw new Error("Respuesta exitosa pero no se pudo parsear el JSON.");
        }

        if (!response.ok) {
          if (response.status === 404) {
            // Usar el mensaje del backend si está disponible en jsonResponse
            const message =
              jsonResponse?.message ||
              `Entrada con slug "${slug}" no encontrada (Error 404).`;
            throw new Error(message);
          }
          // Para otros errores HTTP, intentar usar mensaje de jsonResponse si existe
          const errorText =
            jsonResponse?.error ||
            jsonResponse?.message ||
            `Error HTTP: ${response.status} - No se pudo cargar la entrada.`;
          throw new Error(errorText);
        }

        // Si la respuesta es OK (status 200-299)
        // Validar que jsonResponse (que es `entrada.to_dict()` del backend) sea un objeto válido de post.
        // El backend devuelve el objeto directamente, no un array.
        if (!jsonResponse || typeof jsonResponse.slug === "undefined") {
          throw new Error(
            `La respuesta del servidor para el slug "${slug}" no contiene los datos esperados de la entrada.`
          );
        }
        setPost(jsonResponse as BlogPost);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Ocurrió un error desconocido al cargar la entrada.";
        setError(errorMessage);
        console.error("Error al cargar la entrada:", e);
        setPost(null); // Asegurar que el post sea null en caso de error
      } finally {
        setCargando(false);
      }
    };

    fetchPostData();
  }, [slug]); // API_BASE_URL es constante en este scope, no necesita ser dependencia.

  const pageTitle = useMemo(() => {
    if (cargando) return "Cargando...";
    if (error) return "Error al cargar";
    if (!post) return "Entrada no encontrada";
    return getPostTranslatedField(post, "titulo", currentLanguage);
  }, [post, currentLanguage, cargando, error]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const fechaPublicacionFormateada = useMemo(() => {
    if (!post || !post.fecha_publicacion) {
      return "Fecha desconocida";
    }
    try {
      // Asegurarse que currentLanguage sea un código de idioma válido para toLocaleDateString
      const langForLocale = currentLanguage.toLowerCase().split("_")[0]; // ej. 'es-MX' -> 'es'
      return new Date(post.fecha_publicacion).toLocaleDateString(
        langForLocale, // Usar solo el código de idioma base
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch (e) {
      console.error(
        "Error al formatear la fecha:",
        e,
        "Idioma actual:",
        currentLanguage,
        "Fecha original:",
        post.fecha_publicacion
      );
      return post.fecha_publicacion; // Devolver la fecha original si el formateo falla
    }
  }, [post, currentLanguage]);

  // --- LÓGICA DE RETORNO CONDICIONAL ---
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

  // --- RENDERIZADO PRINCIPAL ---
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
              // Considerar añadir un onError para manejar imágenes rotas
              onError={(e) => (e.currentTarget.style.display = "none")}
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
            {/* Puedes añadir más metadatos aquí si es necesario, ej: autor, categoría */}
            {/* <p className="meta-item">
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
            */}
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
