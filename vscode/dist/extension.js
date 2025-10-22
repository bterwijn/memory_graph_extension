"use strict";var H=Object.create;var f=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var B=Object.getPrototypeOf,R=Object.prototype.hasOwnProperty;var W=(t,e)=>()=>(t&&(e=t(t=0)),e);var z=(t,e)=>{for(var r in e)f(t,r,{get:e[r],enumerable:!0})},I=(t,e,r,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of A(e))!R.call(t,a)&&a!==r&&f(t,a,{get:()=>e[a],enumerable:!(s=U(e,a))||s.enumerable});return t};var l=(t,e,r)=>(r=t!=null?H(B(t)):{},I(e||!t||!t.__esModule?f(r,"default",{value:t,enumerable:!0}):r,t)),V=t=>I(f({},"__esModule",{value:!0}),t);var M={};z(M,{cleanupOldTempFiles:()=>X,generateGraph:()=>J});async function J(t){let e=_.tmpdir(),r=Date.now(),s=P.join(e,`memory_graph_temp_${r}.py`),a=P.join(e,`memory_graph_output_${r}.${t.outputFormat}`);try{let o=Q(t.code,a,t.visualizeType);await N(s,o,"utf8");let{stdout:d,stderr:h}=await K(`${t.pythonPath} "${s}"`,{timeout:3e4});return c.existsSync(a)?(await x(s).catch(()=>{}),{success:!0,outputPath:a,stdout:d,stderr:h}):{success:!1,error:`Output file not generated. stderr: ${h}`,stdout:d,stderr:h}}catch(o){return await x(s).catch(()=>{}),await x(a).catch(()=>{}),{success:!1,error:o.message||String(o),stdout:o.stdout||"",stderr:o.stderr||""}}}function Q(t,e,r){let s=t.replace(/\bmg\.show\([^)]*\)/g,"# mg.show() removed by extension").replace(/\bmg\.render\([^)]*\)/g,"# mg.render() removed by extension").replace(/\bmg\.block\([^)]*\)/g,"# mg.block() removed by extension").replace(/\bmemory_graph\.show\([^)]*\)/g,"# memory_graph.show() removed").replace(/\bmemory_graph\.render\([^)]*\)/g,"# memory_graph.render() removed").replace(/\bmemory_graph\.block\([^)]*\)/g,"# memory_graph.block() removed"),a=e.replace(/\\/g,"\\\\");return`
import memory_graph as mg
import sys

# User code starts here
${s}
# User code ends here

# Generate the graph
try:
    if '${r}' == 'stack':
        mg.render(mg.stack(), "${a}")
    else:
        # Use globals() to capture all variables defined in the file
        mg.render(globals(), "${a}")
    print("Graph generated successfully", file=sys.stderr)
except Exception as e:
    print(f"Error generating graph: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
`}async function X(){let t=_.tmpdir(),e=c.readdirSync(t),s=Date.now()-60*60*1e3;for(let a of e)if(a.startsWith("memory_graph_temp_")||a.startsWith("memory_graph_output_"))try{let o=P.join(t,a);c.statSync(o).mtimeMs<s&&await x(o)}catch{}}var c,P,_,F,G,K,N,x,E=W(()=>{"use strict";c=l(require("fs")),P=l(require("path")),_=l(require("os")),F=require("child_process"),G=require("util"),K=(0,G.promisify)(F.exec),N=(0,G.promisify)(c.writeFile),x=(0,G.promisify)(c.unlink)});var oe={};z(oe,{activate:()=>ee,deactivate:()=>te});module.exports=V(oe);var n=l(require("vscode"));var m=l(require("vscode")),$=require("child_process"),O=require("util"),k=(0,O.promisify)($.exec);async function j(){let e=m.workspace.getConfiguration("memoryGraph").get("pythonPath");if(e)return e;try{let r=m.extensions.getExtension("ms-python.python");if(r){r.isActive||await r.activate();let s=r.exports?.settings?.getExecutionDetails?.()?.execCommand?.[0];if(s)return s}}catch(r){console.log("Could not get Python from extension:",r)}return"python3"}async function L(t){try{let{stdout:e}=await k(`${t} -c "import memory_graph; print('OK')"`);return e.trim()==="OK"}catch{return!1}}async function Y(){try{return await k("dot -V"),!0}catch{return!1}}async function q(t){try{let{stdout:e}=await k(`${t} --version`);return e.trim()}catch{return"Unknown"}}async function w(){let t=await j(),e=await q(t),r=await L(t),s=await Y();return{pythonPath:t,version:e,hasMemoryGraph:r,hasGraphviz:s}}async function g(t){let e=[];if(t.hasMemoryGraph||e.push("memory_graph Python package"),t.hasGraphviz||e.push("Graphviz"),e.length===0)return;let r=`Missing dependencies: ${e.join(", ")}`;if(await m.window.showWarningMessage(r,"Install Instructions","Dismiss")==="Install Instructions"){let a=`
# Memory Graph Dependencies

## Install memory_graph
\`\`\`bash
pip3 install memory_graph
\`\`\`

## Install Graphviz
**macOS (Homebrew):**
\`\`\`bash
brew install graphviz
\`\`\`

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt-get install graphviz
\`\`\`

**Windows:**
Download from: https://graphviz.org/download/

---

Python: ${t.pythonPath}
Version: ${t.version}
`,o=await m.workspace.openTextDocument({content:a,language:"markdown"});await m.window.showTextDocument(o)}}var p=l(require("vscode")),v=l(require("fs")),b=class t{static currentPanel;_panel;_disposables=[];constructor(e,r){this._panel=e,this._panel.webview.html=this._getLoadingHtml(),this._panel.webview.onDidReceiveMessage(s=>{switch(s.command){case"refresh":p.commands.executeCommand("memoryGraph.visualize");break}},null,this._disposables),this._panel.onDidDispose(()=>this.dispose(),null,this._disposables)}static createOrShow(e){let r=p.window.activeTextEditor?p.ViewColumn.Beside:p.ViewColumn.One;if(t.currentPanel)return t.currentPanel._panel.reveal(r),t.currentPanel;let s=p.window.createWebviewPanel("memoryGraphView","Memory Graph",r,{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[e]});return t.currentPanel=new t(s,e),t.currentPanel}updateGraph(e,r,s){if(!v.existsSync(e)){this._panel.webview.html=this._getErrorHtml("Graph file not found");return}if(r==="svg"){let a=v.readFileSync(e,"utf8");this._panel.webview.html=this._getGraphHtml(a,"svg",s)}else{let o=v.readFileSync(e).toString("base64");this._panel.webview.html=this._getGraphHtml(o,"png",s)}}showLoading(){this._panel.webview.html=this._getLoadingHtml()}showError(e){this._panel.webview.html=this._getErrorHtml(e)}_getLoadingHtml(){return`<!DOCTYPE html>
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
</html>`}_getGraphHtml(e,r,s){return`<!DOCTYPE html>
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
</html>`}_escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}dispose(){for(t.currentPanel=void 0,this._panel.dispose();this._disposables.length;){let e=this._disposables.pop();e&&e.dispose()}}};var i=null;async function ee(t){console.log("Memory Graph extension is now active!");let{cleanupOldTempFiles:e}=await Promise.resolve().then(()=>(E(),M));e().catch(o=>console.log("Cleanup error:",o));try{i=await w(),console.log("Python environment check:",i);let o=n.window.createStatusBarItem(n.StatusBarAlignment.Right,100);i.hasMemoryGraph&&i.hasGraphviz?(o.text="$(check) Memory Graph",o.tooltip=`Ready!
Python: ${i.version}
memory_graph: \u2713
Graphviz: \u2713`,o.backgroundColor=void 0):(o.text="$(warning) Memory Graph",o.tooltip="Missing dependencies - click for details",o.backgroundColor=new n.ThemeColor("statusBarItem.warningBackground"),o.command="memoryGraph.checkEnvironment"),o.show(),t.subscriptions.push(o),!i.hasMemoryGraph||!i.hasGraphviz?await g(i):n.window.showInformationMessage("Memory Graph extension loaded! \u{1F389}")}catch(o){console.error("Error checking Python environment:",o),n.window.showErrorMessage("Memory Graph: Failed to detect Python environment")}let r=n.commands.registerCommand("memoryGraph.checkEnvironment",async()=>{try{i=await w();let o=`
Python Environment Status:
- Python: ${i.pythonPath}
- Version: ${i.version}
- memory_graph: ${i.hasMemoryGraph?"\u2713":"\u2717"}
- Graphviz: ${i.hasGraphviz?"\u2713":"\u2717"}
`;i.hasMemoryGraph&&i.hasGraphviz?n.window.showInformationMessage("All dependencies are installed!",{modal:!1,detail:o}):await g(i)}catch(o){n.window.showErrorMessage("Failed to check environment: "+o)}}),s=n.commands.registerCommand("memoryGraph.visualize",async()=>{let o=n.window.activeTextEditor;if(!o){n.window.showErrorMessage("No active editor found");return}if(i||(i=await w()),!i){n.window.showErrorMessage("Failed to detect Python environment");return}if(!i.hasMemoryGraph){await n.window.showErrorMessage("memory_graph package not found","Install Instructions")==="Install Instructions"&&await g(i);return}if(!i.hasGraphviz){await n.window.showErrorMessage("Graphviz not found","Install Instructions")==="Install Instructions"&&await g(i);return}let d=o.selection,h=o.document.getText(d);if(!h){n.window.showWarningMessage("Please select some Python code to visualize");return}let D=i;await n.window.withProgress({location:n.ProgressLocation.Notification,title:"Generating memory graph...",cancellable:!1},async u=>{u.report({increment:0});let{generateGraph:T}=await Promise.resolve().then(()=>(E(),M)),S=n.workspace.getConfiguration("memoryGraph").get("outputFormat","svg");u.report({increment:30,message:"Running Python code..."});let y=await T({code:h,pythonPath:D.pythonPath,outputFormat:S,visualizeType:"locals"});if(u.report({increment:70}),y.success&&y.outputPath){let C=n.Uri.file(y.outputPath);await n.commands.executeCommand("vscode.open",C),n.window.showInformationMessage("Memory graph generated successfully!","Open Again").then(Z=>{Z==="Open Again"&&n.commands.executeCommand("vscode.open",C)})}else n.window.showErrorMessage(`Failed to generate graph: ${y.error}`)})}),a=n.commands.registerCommand("memoryGraph.openPanel",()=>{b.createOrShow(t.extensionUri)});t.subscriptions.push(r),t.subscriptions.push(s),t.subscriptions.push(a)}function te(){console.log("Memory Graph extension is now deactivated")}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
