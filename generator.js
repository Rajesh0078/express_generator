#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';


async function getLibraryVersions() {
    return new Promise((resolve, reject) => {
        exec('npm view express version', (err, stdout) => {
            if (err) {
                reject(err);
                return;
            }
            const expressVersion = stdout.trim();
            exec('npm view mongoose version', (err, stdout) => {
                if (err) {
                    reject(err);
                    return;
                }
                const mongooseVersion = stdout.trim();
                exec('npm view nodemon version', (err, stdout) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const nodemonVersion = stdout.trim();
                    resolve({ express: expressVersion, mongoose: mongooseVersion, nodemon: nodemonVersion });
                });
            });
        });
    });
}

const getPackageJSONContent = async (projectName) => {
    const libraryVersions = await getLibraryVersions();
    return {
        name: projectName,
        version: '1.0.0',
        description: 'Express project generated with create-express-app',
        main: 'server.js',
        scripts: {
            start: 'node server.js',
            server: 'nodemon server.js'
        },
        dependencies: libraryVersions
    }
}

function getServerJSContent(projectName) {
    return `
    const express = require('express');
    const app = express();
    
    app.get('/', (req, res) => {
        res.send('Hello from ${projectName}!');
    });
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log('Server is running on port', PORT);
    });
    `;
}

// Function to create the Express project structure
async function createExpressProject(projectName) {

    const projectDir = path.join(process.cwd(), projectName);

    // Create project directory
    fs.mkdirSync(projectDir);

    // Create subdirectories
    ['controllers', 'models', 'routes', 'config'].forEach(dir => {
        fs.mkdirSync(path.join(projectDir, dir));
    });

    // Create files
    const serverContent = getServerJSContent(projectName)
    fs.writeFileSync(path.join(projectDir, 'server.js'), serverContent);

    const packageJsonContent = await getPackageJSONContent(projectName);
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJsonContent, null, 2));

    execSync(`cd ${projectDir} && npm install`);

    // Success message
    console.log(`Express project "${projectName}" created successfully.`);
}

// Get project name from command line arguments
const projectName = process.argv[2];

// Check if project name is provided
if (!projectName) {
    console.error('Usage: express-generator <project-name>');
    process.exit(1);
}

// Create Express project structure
createExpressProject(projectName);
