// src/contexts/LanguageContext.tsx (o la ruta que prefieras)
import React, { createContext, useState, useContext } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

// Define el tipo para los códigos de idioma, puede ser usado globalmente
export type LanguageCode = "ES" | "EN" | "DE";

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setCurrentLanguage: Dispatch<SetStateAction<LanguageCode>>; // Permite usar la función de seteo directamente
}

// Creamos el contexto con un valor por defecto undefined, pero lo chequearemos al usarlo.
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("ES"); // Idioma por defecto

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar el contexto de idioma fácilmente
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage debe ser usado dentro de un LanguageProvider");
  }
  return context;
};
