const fs = require("fs");
const fse = require('fs-extra');
const path = require('path');

module.exports = class FS {

    // Check if a file or directory exists
    static existsSync(filePath) {
        return fs.existsSync(filePath);
    }

    // Synchronously delete a file if it exists
    static deleteFile(filePath) {
        if (FS.existsSync(filePath)) {
            try {
                fse.unlinkSync(filePath);
                console.log('File deleted successfully:', filePath);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        } else {
            console.log('File not found:', filePath);
        }
    }

    // Get the structure of a directory recursively with ignore options
    static getFolderStructure(dir, options = { ignoreFolders: [] }, concat = false) {
        const { ignoreFolders } = options;
        let results = [];

        for (let file of fs.readdirSync(dir)) {
            file = `${dir}/${file}`;
            if (ignoreFolders.some(folder => file.includes(folder))) continue;

            const stat = fs.statSync(file);
            if (stat.isDirectory()) {
                const folderStructure = FS.getFolderStructure(file, options, concat);
                concat ? results = results.concat(folderStructure) : results.push(folderStructure);
            } else {
                results.push(file);
            }
        }
        return results;
    }

    // Copy file from source to destination
    static copyFile(source, destination) {
        return fse.copy(source, destination)
            .then(() => console.log(`${source} copied to ${destination}`))
            .catch(error => console.error('Error copying file:', error));
    }

    // Copy a file or folder, with overwrite and filter options
    static copyFileOrFolder(source, destination, overwrite = false, excludePublic = true) {
        const options = {
            overwrite,
            filter: file => excludePublic ? !file.includes('public') : true
        };
        return fse.copy(source, destination, options)
            .then(() => console.log(`${source} copied to ${destination}`))
            .catch(error => console.error('Error copying:', error));
    }

    // Move a file or folder
    static moveFileOrFolder(source, destination, overwrite = false) {
        return fse.move(source, destination, { overwrite })
            .then(() => console.log(`${source} moved to ${destination}`))
            .catch(error => console.error('Error moving file/folder:', error));
    }

    // Create directory with recursive option
    static createDirectory(dir) {
        return fse.ensureDir(dir)
            .then(() => console.log(`Directory created: ${dir}`))
            .catch(error => console.error('Error creating directory:', error));
    }

    // Append content to file
    static appendFile(filePath, content) {
        return fs.promises.appendFile(filePath, content)
            .then(() => console.log(`Content appended to ${filePath}`))
            .catch(error => console.error('Error appending content:', error));
    }

    // Get folder path from a file path
    static getFolderPathFromFilePath(filePath) {
        return path.dirname(filePath);
    }

    // Write to a file with optional overwrite
    static writeFile(filePath, content, overwrite = true) {
        const folderPath = FS.getFolderPathFromFilePath(filePath);
        return FS.createDirectory(folderPath)
            .then(() => overwrite || !FS.existsSync(filePath) ? fs.promises.writeFile(filePath, content) : null)
            .then(() => console.log(`File written to ${filePath}`))
            .catch(error => console.error('Error writing file:', error));
    }

    // Read file and return content
    static readFile(filePath) {
        return fs.promises.readFile(filePath, 'utf-8')
            .catch(error => {
                console.error('Error reading file:', error);
                return '';
            });
    }

    // Read and parse JSON file
    static readAndParseFile(filePath) {
        return FS.readFile(filePath)
            .then(data => JSON.parse(data))
            .catch(error => {
                console.error('Error parsing file:', error);
                return null;
            });
    }

    // Delete a directory recursively
    static rmDirectoryForcely(dir) {
        return fse.remove(dir)
            .then(() => console.log(`Directory ${dir} deleted`))
            .catch(error => console.error('Error deleting directory:', error));
    }

    // Get root-level folders in a directory
    static getRootFolders(dirPath) {
        if (!FS.existsSync(dirPath)) return [];
        return fs.readdirSync(dirPath)
            .filter(item => fs.statSync(path.join(dirPath, item)).isDirectory())
            .map(folder => path.join(dirPath, folder));
    }

    // Get last folder or file name from a path
    static getLastFolderOrFileName(filePath) {
        return path.basename(filePath);
    }
};