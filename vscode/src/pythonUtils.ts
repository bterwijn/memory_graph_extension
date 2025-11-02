import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

export interface PythonEnvironment {
    pythonPath: string;
    hasMemoryGraph: boolean;
    hasGraphviz: boolean;
    version: string;
}

/**
 * Get the Python interpreter path with cross-platform support
 */
export async function getPythonPath(): Promise<string> {
    // 1. Check user settings
    const config = vscode.workspace.getConfiguration('memoryGraph');
    const userPythonPath = config.get<string>('pythonPath');
    if (userPythonPath) {
        console.log('Using user-configured Python path:', userPythonPath);
        return userPythonPath;
    }

    // 2. Try to get from Python extension
    try {
        const pythonExtension = vscode.extensions.getExtension('ms-python.python');
        if (pythonExtension) {
            if (!pythonExtension.isActive) {
                await pythonExtension.activate();
            }
            const pythonPath = pythonExtension.exports?.settings?.getExecutionDetails?.()?.execCommand?.[0];
            if (pythonPath) {
                console.log('Using Python from extension:', pythonPath);
                return pythonPath;
            }
        }
    } catch (error) {
        console.log('Could not get Python from extension:', error);
    }

    // 3. Try platform-specific Python commands
    const platform = os.platform();
    let pythonCommands: string[] = [];

    if (platform === 'win32') {
        // Windows: try py launcher, python, python3
        pythonCommands = ['py', 'python', 'python3', 'python.exe'];
    } else if (platform === 'darwin') {
        // macOS: prefer python3, then python
        pythonCommands = ['python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3', 'python'];
    } else {
        // Linux: prefer python3, then python
        pythonCommands = ['python3', '/usr/bin/python3', 'python'];
    }

    // Try each command
    for (const cmd of pythonCommands) {
        try {
            const { stdout } = await execAsync(`${cmd} --version`, { timeout: 5000 });
            // Check if it's Python 3
            if (stdout.includes('Python 3') || stdout.includes('Python 3')) {
                console.log('Found working Python:', cmd, ':', stdout.trim());
                return cmd;
            }
        } catch (error) {
            // Command doesn't exist or failed, try next
            continue;
        }
    }

    // 4. Last resort fallback
    console.log('No Python 3 found, falling back to python3');
    return platform === 'win32' ? 'python' : 'python3';
}

/**
 * Check if memory_graph package is installed
 */
export async function checkMemoryGraph(pythonPath: string): Promise<boolean> {
    try {
        const command = `${pythonPath} -c "import memory_graph; print('OK')"`;
        const { stdout } = await execAsync(command, { timeout: 10000 });
        return stdout.trim() === 'OK';
    } catch (error) {
        console.log('memory_graph check failed:', error);
        return false;
    }
}

/**
 * Check if Graphviz is installed (cross-platform)
 */
export async function checkGraphviz(): Promise<boolean> {
    const platform = os.platform();
    const dotCommand = platform === 'win32' ? 'dot.exe' : 'dot';
    
    try {
        await execAsync(`${dotCommand} -V`, { timeout: 5000 });
        return true;
    } catch (error) {
        // Try without .exe extension on Windows
        if (platform === 'win32') {
            try {
                await execAsync('dot -V', { timeout: 5000 });
                return true;
            } catch (innerError) {
                return false;
            }
        }
        return false;
    }
}

/**
 * Get Python version
 */
export async function getPythonVersion(pythonPath: string): Promise<string> {
    try {
        const { stdout } = await execAsync(`${pythonPath} --version`, { timeout: 5000 });
        return stdout.trim();
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Check the entire Python environment
 */
export async function checkPythonEnvironment(): Promise<PythonEnvironment> {
    const pythonPath = await getPythonPath();
    const version = await getPythonVersion(pythonPath);
    const hasMemoryGraph = await checkMemoryGraph(pythonPath);
    const hasGraphviz = await checkGraphviz();

    console.log('Environment check result:', {
        pythonPath,
        version,
        hasMemoryGraph,
        hasGraphviz,
        platform: os.platform()
    });

    return {
        pythonPath,
        version,
        hasMemoryGraph,
        hasGraphviz
    };
}

/**
 * Show installation instructions based on platform
 */
export async function showInstallationInstructions(env: PythonEnvironment): Promise<void> {
    const missing: string[] = [];

    if (!env.hasMemoryGraph) {
        missing.push('memory_graph Python package');
    }
    if (!env.hasGraphviz) {
        missing.push('Graphviz');
    }

    if (missing.length === 0) {
        return;
    }

    const platform = os.platform();
    const message = `Missing dependencies: ${missing.join(', ')}`;
    const action = await vscode.window.showWarningMessage(
        message,
        'Install Instructions',
        'Dismiss'
    );

    if (action === 'Install Instructions') {
        let instructions = `# Memory Graph Dependencies\n\n`;
        
        if (!env.hasMemoryGraph) {
            instructions += `## Install memory_graph\n`;
            if (platform === 'win32') {
                instructions += `\`\`\`cmd\npip install memory_graph\n# or\npy -m pip install memory_graph\n\`\`\`\n\n`;
            } else {
                instructions += `\`\`\`bash\npip3 install memory_graph\n\`\`\`\n\n`;
            }
        }

        if (!env.hasGraphviz) {
            instructions += `## Install Graphviz\n`;
            
            if (platform === 'win32') {
                instructions += `**Windows:**\n`;
                instructions += `1. Download from: https://graphviz.org/download/\n`;
                instructions += `2. Install and add to PATH\n`;
                instructions += `3. Restart VS Code\n\n`;
            } else if (platform === 'darwin') {
                instructions += `**macOS (Homebrew):**\n`;
                instructions += `\`\`\`bash\nbrew install graphviz\n\`\`\`\n\n`;
            } else {
                instructions += `**Linux (Ubuntu/Debian):**\n`;
                instructions += `\`\`\`bash\nsudo apt-get install graphviz\n\`\`\`\n\n`;
                instructions += `**Linux (Fedora/RHEL):**\n`;
                instructions += `\`\`\`bash\nsudo dnf install graphviz\n\`\`\`\n\n`;
            }
        }

        instructions += `---\n\n`;
        instructions += `**Your System:**\n`;
        instructions += `- Platform: ${platform}\n`;
        instructions += `- Python: ${env.pythonPath}\n`;
        instructions += `- Version: ${env.version}\n`;

        const doc = await vscode.workspace.openTextDocument({
            content: instructions,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }
}