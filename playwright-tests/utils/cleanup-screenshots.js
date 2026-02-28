/**
 * Script para limpiar screenshots después de cada test
 * 
 * Uso:
 * node playwright-tests/utils/cleanup-screenshots.js [folder]
 * 
 * Ejemplos:
 * node playwright-tests/utils/cleanup-screenshots.js 01-owner-registration
 * node playwright-tests/utils/cleanup-screenshots.js all
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

/**
 * Elimina todos los archivos PNG de una carpeta
 */
function cleanupFolder(folderName) {
  const folderPath = path.join(SCREENSHOTS_DIR, folderName);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Carpeta no existe: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);
  const pngFiles = files.filter(file => file.endsWith('.png'));

  if (pngFiles.length === 0) {
    console.log(`ℹ️  No hay screenshots en: ${folderName}`);
    return;
  }

  let deletedCount = 0;
  pngFiles.forEach(file => {
    const filePath = path.join(folderPath, file);
    try {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`🗑️  Eliminado: ${file}`);
    } catch (error) {
      console.error(`❌ Error al eliminar ${file}:`, error.message);
    }
  });

  console.log(`✅ Eliminados ${deletedCount} screenshots de ${folderName}\n`);
}

/**
 * Limpia todas las carpetas de screenshots
 */
function cleanupAll() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.log(`❌ Directorio de screenshots no existe: ${SCREENSHOTS_DIR}`);
    return;
  }

  const folders = fs.readdirSync(SCREENSHOTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (folders.length === 0) {
    console.log('ℹ️  No hay carpetas de screenshots');
    return;
  }

  console.log(`🧹 Limpiando ${folders.length} carpetas...\n`);
  folders.forEach(folder => cleanupFolder(folder));
  console.log('✅ Limpieza completada');
}

/**
 * Mantiene solo los últimos N screenshots de cada carpeta
 */
function keepLatest(folderName, count = 5) {
  const folderPath = path.join(SCREENSHOTS_DIR, folderName);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Carpeta no existe: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.png'))
    .map(file => ({
      name: file,
      path: path.join(folderPath, file),
      time: fs.statSync(path.join(folderPath, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); // Más recientes primero

  if (files.length <= count) {
    console.log(`ℹ️  Solo hay ${files.length} screenshots, no se elimina nada`);
    return;
  }

  const toDelete = files.slice(count);
  toDelete.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Eliminado: ${file.name}`);
    } catch (error) {
      console.error(`❌ Error al eliminar ${file.name}:`, error.message);
    }
  });

  console.log(`✅ Mantenidos ${count} screenshots más recientes, eliminados ${toDelete.length}`);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'help';

console.log('🧹 Screenshot Cleanup Utility\n');

switch (command) {
  case 'all':
    cleanupAll();
    break;
  
  case 'keep-latest':
    const folder = args[1];
    const count = parseInt(args[2]) || 5;
    if (!folder) {
      console.log('❌ Uso: node cleanup-screenshots.js keep-latest <folder> [count]');
      process.exit(1);
    }
    keepLatest(folder, count);
    break;
  
  case 'help':
    console.log('Uso:');
    console.log('  node cleanup-screenshots.js <folder>           - Limpia una carpeta específica');
    console.log('  node cleanup-screenshots.js all                - Limpia todas las carpetas');
    console.log('  node cleanup-screenshots.js keep-latest <folder> [count] - Mantiene solo los últimos N screenshots');
    console.log('\nEjemplos:');
    console.log('  node cleanup-screenshots.js 01-owner-registration');
    console.log('  node cleanup-screenshots.js all');
    console.log('  node cleanup-screenshots.js keep-latest 01-owner-registration 10');
    break;
  
  default:
    cleanupFolder(command);
    break;
}
