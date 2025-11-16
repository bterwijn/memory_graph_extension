import * as vscode from 'vscode';
import { checkPythonEnvironment, showInstallationInstructions, PythonEnvironment } from './pythonUtils';
import { MemoryGraphPanel } from './webviewPanel';

let pythonEnv: PythonEnvironment | null = null;

/**
 * This method is called when the extension is activated
 * Activation happens when a Python file is opened
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('Memory Graph extension is now active!');

    // Clean up old temporary files
    const { cleanupOldTempFiles } = await import('./graphGenerator');
    cleanupOldTempFiles().catch((err: any) => console.log('Cleanup error:', err));

    // Check Python environment on activation
    try {
        pythonEnv = await checkPythonEnvironment();
        console.log('Python environment check:', pythonEnv);

        // Show status in status bar
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        if (pythonEnv.hasMemoryGraph && pythonEnv.hasGraphviz) {
            statusBarItem.text = "$(check) Memory Graph";
            statusBarItem.tooltip = `Ready!\nPython: ${pythonEnv.version}\nmemory_graph: ✓\nGraphviz: ✓`;
            statusBarItem.backgroundColor = undefined;
        } else {
            statusBarItem.text = "$(warning) Memory Graph";
            statusBarItem.tooltip = "Missing dependencies - click for details";
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            statusBarItem.command = 'memoryGraph.checkEnvironment';
        }
        
        statusBarItem.show();
        context.subscriptions.push(statusBarItem);

        // Show installation instructions if needed
        if (!pythonEnv.hasMemoryGraph || !pythonEnv.hasGraphviz) {
            await showInstallationInstructions(pythonEnv);
        } else {
            vscode.window.showInformationMessage('Memory Graph extension loaded! 🎉');
        }
    } catch (error) {
        console.error('Error checking Python environment:', error);
        vscode.window.showErrorMessage('Memory Graph: Failed to detect Python environment');
    }

    // Register command: Check Environment
    const checkEnvCommand = vscode.commands.registerCommand(
        'memoryGraph.checkEnvironment',
        async () => {
            try {
                pythonEnv = await checkPythonEnvironment();
                
                const status = `
Python Environment Status:
- Python: ${pythonEnv.pythonPath}
- Version: ${pythonEnv.version}
- memory_graph: ${pythonEnv.hasMemoryGraph ? '✓' : '✗'}
- Graphviz: ${pythonEnv.hasGraphviz ? '✓' : '✗'}
`;
                
                if (pythonEnv.hasMemoryGraph && pythonEnv.hasGraphviz) {
                    vscode.window.showInformationMessage(
                        'All dependencies are installed!',
                        { modal: false, detail: status }
                    );
                } else {
                    await showInstallationInstructions(pythonEnv);
                }
            } catch (error) {
                vscode.window.showErrorMessage('Failed to check environment: ' + error);
            }
        }
    );

    // Register command: Visualize Selection
    const visualizeCommand = vscode.commands.registerCommand(
        'memoryGraph.visualize',
        async () => {
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            // Check environment first
            if (!pythonEnv) {
                pythonEnv = await checkPythonEnvironment();
            }

            // Guard against null pythonEnv
            if (!pythonEnv) {
                vscode.window.showErrorMessage('Failed to detect Python environment');
                return;
            }

            if (!pythonEnv.hasMemoryGraph) {
                const action = await vscode.window.showErrorMessage(
                    'memory_graph package not found',
                    'Install Instructions'
                );
                if (action === 'Install Instructions') {
                    await showInstallationInstructions(pythonEnv);
                }
                return;
            }

            if (!pythonEnv.hasGraphviz) {
                const action = await vscode.window.showErrorMessage(
                    'Graphviz not found',
                    'Install Instructions'
                );
                if (action === 'Install Instructions') {
                    await showInstallationInstructions(pythonEnv);
                }
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (!selectedText) {
                vscode.window.showWarningMessage('Please select some Python code to visualize');
                return;
            }

            // Store pythonEnv for use in callback
            const currentPythonEnv = pythonEnv;

            // Create or show the webview panel
            const panel = MemoryGraphPanel.createOrShow(context.extensionUri);
            panel.showLoading();

            // Show progress notification
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating memory graph...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });

                // Import graph generator
                const { generateGraph } = await import('./graphGenerator');
                
                // Get output format from settings
                const config = vscode.workspace.getConfiguration('memoryGraph');
                const outputFormat = config.get<'svg' | 'png'>('outputFormat', 'svg');

                progress.report({ increment: 30, message: "Running Python code..." });

                // Generate the graph
                const result = await generateGraph({
                    code: selectedText,
                    pythonPath: currentPythonEnv.pythonPath,
                    outputFormat: outputFormat,
                    visualizeType: 'locals'
                });

                progress.report({ increment: 70 });

                if (result.success && result.outputPath) {
                    // Display in webview panel with program output
                    const programOutput = {
                        stdout: result.stdout || '',
                        stderr: result.stderr || ''
                    };
                    panel.updateGraph(result.outputPath, outputFormat, programOutput);
                    
                    vscode.window.showInformationMessage('Memory graph generated successfully!');
                } else {
                    panel.showError(result.error || 'Unknown error');
                    vscode.window.showErrorMessage(
                        `Failed to generate graph: ${result.error}`
                    );
                }
            });
        }
    );

    // Register command: Visualize Current File
    const visualizeFileCommand = vscode.commands.registerCommand(
        'memoryGraph.visualizeFile',
        async () => {
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            if (editor.document.languageId !== 'python') {
                vscode.window.showErrorMessage('This command only works with Python files');
                return;
            }

            // Check environment first
            if (!pythonEnv) {
                pythonEnv = await checkPythonEnvironment();
            }

            // Guard against null pythonEnv
            if (!pythonEnv) {
                vscode.window.showErrorMessage('Failed to detect Python environment');
                return;
            }

            if (!pythonEnv.hasMemoryGraph) {
                const action = await vscode.window.showErrorMessage(
                    'memory_graph package not found',
                    'Install Instructions'
                );
                if (action === 'Install Instructions') {
                    await showInstallationInstructions(pythonEnv);
                }
                return;
            }

            if (!pythonEnv.hasGraphviz) {
                const action = await vscode.window.showErrorMessage(
                    'Graphviz not found',
                    'Install Instructions'
                );
                if (action === 'Install Instructions') {
                    await showInstallationInstructions(pythonEnv);
                }
                return;
            }

            // Get the entire file content
            const fileContent = editor.document.getText();

            if (!fileContent.trim()) {
                vscode.window.showWarningMessage('The file is empty');
                return;
            }

            // Store pythonEnv for use in callback
            const currentPythonEnv = pythonEnv;
            const fileName = editor.document.fileName.split('/').pop() || 'file';

            // Create or show the webview panel
            const panel = MemoryGraphPanel.createOrShow(context.extensionUri);
            panel.showLoading();

            // Update panel title with filename
            panel.setTitle(`Memory Graph - ${fileName}`);

            // Show progress notification
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Generating memory graph for ${fileName}...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });

                // Import graph generator
                const { generateGraph } = await import('./graphGenerator');
                
                // Get output format from settings
                const config = vscode.workspace.getConfiguration('memoryGraph');
                const outputFormat = config.get<'svg' | 'png'>('outputFormat', 'svg');

                progress.report({ increment: 30, message: "Executing Python file..." });

                // Generate the graph from entire file
                const result = await generateGraph({
                    code: fileContent,
                    pythonPath: currentPythonEnv.pythonPath,
                    outputFormat: outputFormat,
                    visualizeType: 'locals'
                });

                progress.report({ increment: 70 });

                if (result.success && result.outputPath) {
                    // Display in webview panel with program output
                    const programOutput = {
                        stdout: result.stdout || '',
                        stderr: result.stderr || ''
                    };
                    panel.updateGraph(result.outputPath, outputFormat, programOutput);
                    
                    vscode.window.showInformationMessage(`Memory graph for ${fileName} generated successfully!`);
                } else {
                    panel.showError(result.error || 'Unknown error');
                    vscode.window.showErrorMessage(
                        `Failed to generate graph: ${result.error}`
                    );
                }
            });
        }
    );

    // Register command: Open Panel
    const openPanelCommand = vscode.commands.registerCommand(
        'memoryGraph.openPanel',
        () => {
            MemoryGraphPanel.createOrShow(context.extensionUri);
        }
    );

    // Add commands to subscriptions for cleanup
    context.subscriptions.push(checkEnvCommand);
    context.subscriptions.push(visualizeCommand);
    context.subscriptions.push(visualizeFileCommand);
    context.subscriptions.push(openPanelCommand);
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
    console.log('Memory Graph extension is now deactivated');
}