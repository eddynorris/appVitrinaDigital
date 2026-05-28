import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  /**
   * Comprime una imagen en el cliente utilizando Canvas API.
   * Redimensiona la imagen si excede las dimensiones máximas y reduce su calidad JPEG.
   * @param file Archivo de imagen original
   * @param maxDimension Ancho o alto máximo en píxeles (default: 1200)
   * @param quality Calidad de compresión entre 0 y 1 (default: 0.8)
   * @returns Promesa con el nuevo archivo File comprimido
   */
  async comprimirImagen(file: File, maxDimension: number = 1200, quality: number = 0.8): Promise<File> {
    // Si no es una imagen, retornar el archivo sin modificar
    if (!file.type.startsWith('image/')) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          // Calcular las nuevas dimensiones manteniendo la relación de aspecto
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          // Crear Canvas para redibujar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('No se pudo obtener el contexto 2d del Canvas'));
          }

          // Dibujar la imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Exportar como Blob con calidad reducida
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Error al convertir el Canvas a Blob'));
              }
              // Crear un nuevo archivo File con el Blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
    });
  }
}
