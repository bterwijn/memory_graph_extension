"use strict";var L=Object.create;var E=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var W=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,B=Object.prototype.hasOwnProperty;var j=(t,e)=>()=>(t&&(e=t(t=0)),e);var S=(t,e)=>{for(var r in e)E(t,r,{get:e[r],enumerable:!0})},D=(t,e,r,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of W(e))!B.call(t,s)&&s!==r&&E(t,s,{get:()=>e[s],enumerable:!(a=V(e,s))||a.enumerable});return t};var u=(t,e,r)=>(r=t!=null?L(A(t)):{},D(e||!t||!t.__esModule?E(r,"default",{value:t,enumerable:!0}):r,t)),N=t=>D(E({},"__esModule",{value:!0}),t);var C={};S(C,{cleanupOldTempFiles:()=>oe,generateGraph:()=>ee});async function ee(t){let e=O.tmpdir(),r=Date.now(),a=z.join(e,`memory_graph_temp_${r}.py`),s=z.join(e,`memory_graph_output_${r}.${t.outputFormat}`);try{let o=te(t.code,s,t.visualizeType);await X(a,o,"utf8");let{stdout:i,stderr:m}=await Q(`${t.pythonPath} "${a}"`,{timeout:3e4});return h.existsSync(s)?(await _(a).catch(()=>{}),{success:!0,outputPath:s,stdout:i,stderr:m}):{success:!1,error:`Output file not generated. stderr: ${m}`,stdout:i,stderr:m}}catch(o){return await _(a).catch(()=>{}),await _(s).catch(()=>{}),{success:!1,error:o.message||String(o),stdout:o.stdout||"",stderr:o.stderr||""}}}function te(t,e,r){let a=t.replace(/\bmg\.show\([^)]*\)/g,"# mg.show() removed by extension").replace(/\bmg\.render\([^)]*\)/g,"# mg.render() removed by extension").replace(/\bmg\.block\([^)]*\)/g,"# mg.block() removed by extension").replace(/\bmemory_graph\.show\([^)]*\)/g,"# memory_graph.show() removed").replace(/\bmemory_graph\.render\([^)]*\)/g,"# memory_graph.render() removed").replace(/\bmemory_graph\.block\([^)]*\)/g,"# memory_graph.block() removed"),s=e.replace(/\\/g,"\\\\").replace(/'/g,"\\'");return`
import memory_graph as mg
import sys

# User code starts here
${a}
# User code ends here

# Generate the graph
try:
    if '${r}' == 'stack':
        mg.render(mg.stack(), "${s}")
    else:
        # Use globals() to capture all variables defined in the file
        mg.render(globals(), "${s}")
    print("Graph generated successfully", file=sys.stderr)
except Exception as e:
    print(f"Error generating graph: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
`}async function oe(){let t=O.tmpdir(),e=h.readdirSync(t),a=Date.now()-60*60*1e3;for(let s of e)if(s.startsWith("memory_graph_temp_")||s.startsWith("memory_graph_output_"))try{let o=z.join(t,s);h.statSync(o).mtimeMs<a&&await _(o)}catch{}}var h,z,O,Z,I,Q,X,_,$=j(()=>{"use strict";h=u(require("fs")),z=u(require("path")),O=u(require("os")),Z=require("child_process"),I=require("util"),Q=(0,I.promisify)(Z.exec),X=(0,I.promisify)(h.writeFile),_=(0,I.promisify)(h.unlink)});var se={};S(se,{activate:()=>ne,deactivate:()=>re});module.exports=N(se);var n=u(require("vscode"));var g=u(require("vscode")),U=require("child_process"),H=require("util"),x=u(require("os")),P=(0,H.promisify)(U.exec);async function Y(){let e=g.workspace.getConfiguration("memoryGraph").get("pythonPath");if(e)return console.log("Using user-configured Python path:",e),e;try{let s=g.extensions.getExtension("ms-python.python");if(s){s.isActive||await s.activate();let o=s.exports?.settings?.getExecutionDetails?.()?.execCommand?.[0];if(o)return console.log("Using Python from extension:",o),o}}catch(s){console.log("Could not get Python from extension:",s)}let r=x.platform(),a=[];r==="win32"?a=["py","python","python3","python.exe"]:r==="darwin"?a=["python3","/usr/local/bin/python3","/opt/homebrew/bin/python3","python"]:a=["python3","/usr/bin/python3","python"];for(let s of a)try{let{stdout:o}=await P(`${s} --version`,{timeout:5e3});if(o.includes("Python 3")||o.includes("Python 3"))return console.log("Found working Python:",s,":",o.trim()),s}catch{continue}return console.log("No Python 3 found, falling back to python3"),r==="win32"?"python":"python3"}async function q(t){try{let e=`${t} -c "import memory_graph; print('OK')"`,{stdout:r}=await P(e,{timeout:1e4});return r.trim()==="OK"}catch(e){return console.log("memory_graph check failed:",e),!1}}async function K(){let t=x.platform(),e=t==="win32"?"dot.exe":"dot";try{return await P(`${e} -V`,{timeout:5e3}),!0}catch{if(t==="win32")try{return await P("dot -V",{timeout:5e3}),!0}catch{return!1}return!1}}async function J(t){try{let{stdout:e}=await P(`${t} --version`,{timeout:5e3});return e.trim()}catch{return"Unknown"}}async function G(){let t=await Y(),e=await J(t),r=await q(t),a=await K();return console.log("Environment check result:",{pythonPath:t,version:e,hasMemoryGraph:r,hasGraphviz:a,platform:x.platform()}),{pythonPath:t,version:e,hasMemoryGraph:r,hasGraphviz:a}}async function v(t){let e=[];if(t.hasMemoryGraph||e.push("memory_graph Python package"),t.hasGraphviz||e.push("Graphviz"),e.length===0)return;let r=x.platform(),a=`Missing dependencies: ${e.join(", ")}`;if(await g.window.showWarningMessage(a,"Install Instructions","Dismiss")==="Install Instructions"){let o=`# Memory Graph Dependencies

`;t.hasMemoryGraph||(o+=`## Install memory_graph
`,r==="win32"?o+="```cmd\npip install memory_graph\n# or\npy -m pip install memory_graph\n```\n\n":o+="```bash\npip3 install memory_graph\n```\n\n"),t.hasGraphviz||(o+=`## Install Graphviz
`,r==="win32"?(o+=`**Windows:**
`,o+=`1. Download from: https://graphviz.org/download/
`,o+=`2. Install and add to PATH
`,o+=`3. Restart VS Code

`):r==="darwin"?(o+=`**macOS (Homebrew):**
`,o+="```bash\nbrew install graphviz\n```\n\n"):(o+=`**Linux (Ubuntu/Debian):**
`,o+="```bash\nsudo apt-get install graphviz\n```\n\n",o+=`**Linux (Fedora/RHEL):**
`,o+="```bash\nsudo dnf install graphviz\n```\n\n")),o+=`---

`,o+=`**Your System:**
`,o+=`- Platform: ${r}
`,o+=`- Python: ${t.pythonPath}
`,o+=`- Version: ${t.version}
`;let i=await g.workspace.openTextDocument({content:o,language:"markdown"});await g.window.showTextDocument(i)}}var y=u(require("vscode")),k=u(require("fs")),w=class t{static currentPanel;_panel;_disposables=[];constructor(e,r){this._panel=e,this._panel.webview.html=this._getLoadingHtml(),this._panel.webview.onDidReceiveMessage(a=>{switch(a.command){case"refresh":y.commands.executeCommand("memoryGraph.visualize");break}},null,this._disposables),this._panel.onDidDispose(()=>this.dispose(),null,this._disposables)}static createOrShow(e){let r=y.window.activeTextEditor?y.ViewColumn.Beside:y.ViewColumn.One;if(t.currentPanel)return t.currentPanel._panel.reveal(r),t.currentPanel;let a=y.window.createWebviewPanel("memoryGraphView","Memory Graph",r,{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[e]});return t.currentPanel=new t(a,e),t.currentPanel}updateGraph(e,r,a){if(!k.existsSync(e)){this._panel.webview.html=this._getErrorHtml("Graph file not found");return}if(r==="svg"){let s=k.readFileSync(e,"utf8");this._panel.webview.html=this._getGraphHtml(s,"svg",a)}else{let o=k.readFileSync(e).toString("base64");this._panel.webview.html=this._getGraphHtml(o,"png",a)}}showLoading(){this._panel.webview.html=this._getLoadingHtml()}showError(e){this._panel.webview.html=this._getErrorHtml(e)}setTitle(e){this._panel.title=e}_getLoadingHtml(){return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Graph</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .message {
            text-align: center;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="message">
        <p>Select Python code and use "Memory Graph: Visualize Selection" to generate a graph.</p>
    </div>
</body>
</html>`}_getErrorHtml(e){return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Graph - Error</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-editor-background);
        }
        .error {
            text-align: center;
            padding: 20px;
            max-width: 600px;
        }
    </style>
</head>
<body>
    <div class="error">
        <h2>Error</h2>
        <p>${this._escapeHtml(e)}</p>
    </div>
</body>
</html>`}_getGraphHtml(e,r,a){return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Graph</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            overflow: auto;
        }
        .toolbar {
            position: sticky;
            top: 0;
            background-color: var(--vscode-editor-background);
            padding: 10px 0;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
            z-index: 100;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin-right: 8px;
            cursor: pointer;
            font-size: 13px;
            border-radius: 2px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .graph-container {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: calc(100vh - 100px);
        }
        svg {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button onclick="refresh()">Refresh</button>
        <button onclick="zoomIn()">Zoom In</button>
        <button onclick="zoomOut()">Zoom Out</button>
        <button onclick="resetZoom()">Reset Zoom</button>
    </div>
    <div class="graph-container" id="graphContainer">
        ${r==="svg"?e:`<img src="data:image/png;base64,${e}" style="max-width: 100%; height: auto;" />`}
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        let currentZoom = 1;

        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }

        function zoomIn() {
            currentZoom = Math.min(currentZoom + 0.2, 3);
            applyZoom();
        }

        function zoomOut() {
            currentZoom = Math.max(currentZoom - 0.2, 0.5);
            applyZoom();
        }

        function resetZoom() {
            currentZoom = 1;
            applyZoom();
        }

        function applyZoom() {
            const container = document.getElementById('graphContainer');
            container.style.transform = 'scale(' + currentZoom + ')';
            container.style.transformOrigin = 'top center';
        }
    </script>
</body>
</html>`}_escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}dispose(){for(t.currentPanel=void 0,this._panel.dispose();this._disposables.length;){let e=this._disposables.pop();e&&e.dispose()}}};var c=null;async function ne(t){console.log("Memory Graph extension is now active!");let{cleanupOldTempFiles:e}=await Promise.resolve().then(()=>($(),C));e().catch(i=>console.log("Cleanup error:",i));try{c=await G(),console.log("Python environment check:",c);let i=n.window.createStatusBarItem(n.StatusBarAlignment.Right,100);c.hasMemoryGraph&&c.hasGraphviz?(i.text="$(check) Memory Graph",i.tooltip=`Ready!
Python: ${c.version}
memory_graph: \u2713
Graphviz: \u2713`,i.backgroundColor=void 0):(i.text="$(warning) Memory Graph",i.tooltip="Missing dependencies - click for details",i.backgroundColor=new n.ThemeColor("statusBarItem.warningBackground"),i.command="memoryGraph.checkEnvironment"),i.show(),t.subscriptions.push(i),!c.hasMemoryGraph||!c.hasGraphviz?await v(c):n.window.showInformationMessage("Memory Graph extension loaded! \u{1F389}")}catch(i){console.error("Error checking Python environment:",i),n.window.showErrorMessage("Memory Graph: Failed to detect Python environment")}let r=n.commands.registerCommand("memoryGraph.checkEnvironment",async()=>{try{c=await G();let i=`
Python Environment Status:
- Python: ${c.pythonPath}
- Version: ${c.version}
- memory_graph: ${c.hasMemoryGraph?"\u2713":"\u2717"}
- Graphviz: ${c.hasGraphviz?"\u2713":"\u2717"}
`;c.hasMemoryGraph&&c.hasGraphviz?n.window.showInformationMessage("All dependencies are installed!",{modal:!1,detail:i}):await v(c)}catch(i){n.window.showErrorMessage("Failed to check environment: "+i)}}),a=n.commands.registerCommand("memoryGraph.visualize",async()=>{let i=n.window.activeTextEditor;if(!i){n.window.showErrorMessage("No active editor found");return}if(c||(c=await G()),!c){n.window.showErrorMessage("Failed to detect Python environment");return}if(!c.hasMemoryGraph){await n.window.showErrorMessage("memory_graph package not found","Install Instructions")==="Install Instructions"&&await v(c);return}if(!c.hasGraphviz){await n.window.showErrorMessage("Graphviz not found","Install Instructions")==="Install Instructions"&&await v(c);return}let m=i.selection,M=i.document.getText(m);if(!M){n.window.showWarningMessage("Please select some Python code to visualize");return}let f=c,d=w.createOrShow(t.extensionUri);d.showLoading(),await n.window.withProgress({location:n.ProgressLocation.Notification,title:"Generating memory graph...",cancellable:!1},async p=>{p.report({increment:0});let{generateGraph:F}=await Promise.resolve().then(()=>($(),C)),b=n.workspace.getConfiguration("memoryGraph").get("outputFormat","svg");p.report({increment:30,message:"Running Python code..."});let l=await F({code:M,pythonPath:f.pythonPath,outputFormat:b,visualizeType:"locals"});if(p.report({increment:70}),l.success&&l.outputPath){let T={stdout:l.stdout||"",stderr:l.stderr||""};d.updateGraph(l.outputPath,b,T),n.window.showInformationMessage("Memory graph generated successfully!")}else d.showError(l.error||"Unknown error"),n.window.showErrorMessage(`Failed to generate graph: ${l.error}`)})}),s=n.commands.registerCommand("memoryGraph.visualizeFile",async()=>{let i=n.window.activeTextEditor;if(!i){n.window.showErrorMessage("No active editor found");return}if(i.document.languageId!=="python"){n.window.showErrorMessage("This command only works with Python files");return}if(c||(c=await G()),!c){n.window.showErrorMessage("Failed to detect Python environment");return}if(!c.hasMemoryGraph){await n.window.showErrorMessage("memory_graph package not found","Install Instructions")==="Install Instructions"&&await v(c);return}if(!c.hasGraphviz){await n.window.showErrorMessage("Graphviz not found","Install Instructions")==="Install Instructions"&&await v(c);return}let m=i.document.getText();if(!m.trim()){n.window.showWarningMessage("The file is empty");return}let M=c,f=i.document.fileName.split("/").pop()||"file",d=w.createOrShow(t.extensionUri);d.showLoading(),d.setTitle(`Memory Graph - ${f}`),await n.window.withProgress({location:n.ProgressLocation.Notification,title:`Generating memory graph for ${f}...`,cancellable:!1},async p=>{p.report({increment:0});let{generateGraph:F}=await Promise.resolve().then(()=>($(),C)),b=n.workspace.getConfiguration("memoryGraph").get("outputFormat","svg");p.report({increment:30,message:"Executing Python file..."});let l=await F({code:m,pythonPath:M.pythonPath,outputFormat:b,visualizeType:"locals"});if(p.report({increment:70}),l.success&&l.outputPath){let T={stdout:l.stdout||"",stderr:l.stderr||""};d.updateGraph(l.outputPath,b,T),n.window.showInformationMessage(`Memory graph for ${f} generated successfully!`)}else d.showError(l.error||"Unknown error"),n.window.showErrorMessage(`Failed to generate graph: ${l.error}`)})}),o=n.commands.registerCommand("memoryGraph.openPanel",()=>{w.createOrShow(t.extensionUri)});t.subscriptions.push(r),t.subscriptions.push(a),t.subscriptions.push(s),t.subscriptions.push(o)}function re(){console.log("Memory Graph extension is now deactivated")}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
