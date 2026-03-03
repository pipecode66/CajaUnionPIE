const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const maxSizeBytes = 5 * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateImageFile = (file: File): FileValidationResult => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      message: 'Formato no permitido. Usa JPG, PNG o WEBP.',
    };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Tipo de archivo invalido. Solo se aceptan imagenes seguras.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: 'La imagen supera el limite de 5MB.',
    };
  }

  const suspiciousPattern = /(\.php|\.js|\.exe|\.sh)$/i;
  if (suspiciousPattern.test(file.name)) {
    return {
      isValid: false,
      message: 'Nombre de archivo sospechoso. Renombra la imagen e intenta de nuevo.',
    };
  }

  return { isValid: true };
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No fue posible leer la imagen.'));
    reader.readAsDataURL(file);
  });
