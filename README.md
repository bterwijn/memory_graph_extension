# Memory Graph - VS Code Extension

Visualize Python data structures, references, mutability, and memory relationships directly in Visual Studio Code.

Built on top of the [memory_graph](https://github.com/Akshen/memory_graph) Python package.

## Features

- **Visual Data Structure Debugging** - See your data structures as intuitive graphs
- **Reference Tracking** - Understand which variables share data and avoid mutation bugs
- **Complete Program Visualization** - Execute entire Python files and visualize final state
- **Program Output Display** - See print statements alongside memory graphs
- **Inline Visualization** - Graphs display in a VS Code panel alongside your code
- **Interactive Controls** - Zoom, refresh, and explore your memory graphs
- **Automatic Environment Detection** - Checks for Python, memory_graph, and Graphviz
- **Progress Notifications** - Clear feedback during graph generation
- **Educational Focus** - Perfect for students learning Python data structures

## Requirements

### Python Environment
- Python 3.6 or higher
- `memory_graph` Python package:
  ```bash
  pip install memory_graph
  ```

### Graphviz
- **macOS (Homebrew):**
  ```bash
  brew install graphviz
  ```
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt-get install graphviz
  ```
- **Windows:**
  Download from [graphviz.org/download](https://graphviz.org/download/)

## Installation

1. Clone the repository and navigate to the extension:
   ```bash
   git clone https://github.com/bterwijn/memory_graph_extension.git
   cd memory_graph_extension/vscode
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run compile
   ```

4. Press `F5` in VS Code to launch the Extension Development Host

## Usage

### Method 1: Visualize Complete Files (Recommended for Students)

Perfect for complete programs and learning assignments.

1. **Write a complete Python program:**
   ```python
   # student_assignment.py
   print("Starting program...")
   
   students = ['Alice', 'Bob', 'Charlie']
   scores = {'Alice': 95, 'Bob': 87, 'Charlie': 92}
   
   total = sum(scores.values())
   average = total / len(students)
   
   print(f"Class average: {average}")
   
   # This creates a reference!
   top_students = students
   top_students.append('Diana')
   
   print(f"All students: {students}")
   ```

2. **Right-click anywhere in the file** → **"Memory Graph: Visualize Current File"**
   - Or use Command Palette: `Ctrl+Shift+P` → "Memory Graph: Visualize Current File"

3. **View results:**
   - Program output appears at the top (all print statements)
   - Memory graph appears below showing all variables
   - See why `students` also has 'Diana' (reference sharing!)

### Method 2: Visualize Code Selections

Perfect for exploring specific code snippets.

1. **Select Python code:**
   ```python
   a = [1, 2, 3]
   b = a
   b.append(4)
   
   c = {'name': 'test', 'items': a}
   ```

2. **Right-click** and choose **"Memory Graph: Visualize Selection"**

3. **View the graph** showing:
   - All variables and their values
   - References between objects
   - Shared data (when multiple variables point to the same object)

### Commands

- **Memory Graph: Visualize Current File** - Execute and visualize entire Python file (NEW in Phase 3.1)
- **Memory Graph: Visualize Selection** - Generate graph from selected Python code
- **Memory Graph: Open Visualization Panel** - Open the graph panel
- **Memory Graph: Check Environment** - Verify dependencies are installed

### Panel Controls

Once a graph is displayed, you can:
- **Refresh** - Regenerate the graph with updated code
- **Zoom In/Out** - Explore complex graphs in detail
- **Reset Zoom** - Return to default view

## Configuration

Access settings via VS Code preferences:

- `memoryGraph.pythonPath` - Custom Python interpreter path (leave empty to use workspace Python)
- `memoryGraph.outputFormat` - Graph format: `svg` (default) or `png`

## Examples

### Example 1: Complete Program (Student Assignment)
```python
# assignment.py - Find the bug!
data = [10, 20, 30]
backup = data

# Modify data
for i in range(len(data)):
    data[i] = data[i] * 2

print(f"Data: {data}")
print(f"Backup: {backup}")  # Wait, backup changed too!
```

**Use "Visualize Current File"** to see:
- Program output showing both lists changed
- Memory graph showing `data` and `backup` point to same list
- Understanding: need `backup = data.copy()` instead!

### Example 2: Understanding References
```python
# Variables sharing the same list
a = [1, 2, 3]
b = a
b.append(4)
print(a)  # [1, 2, 3, 4] - Why?
```
**Visualize this** to see that `a` and `b` point to the same list object.

### Example 3: Shallow vs Deep Copy
```python
import copy

original = [[1, 2], [3, 4]]
shallow = copy.copy(original)
deep = copy.deepcopy(original)

shallow[0].append(5)
```
**Visualize this** to see how shallow copy shares nested objects but deep copy doesn't.

### Example 4: Dictionary References
```python
data = {'x': 10, 'y': 20}
config = {'settings': data}
backup = data

data['x'] = 999
```
**Visualize this** to see how `config['settings']`, `backup`, and `data` all reference the same dictionary.

### Example 5: Function Scope (Complete File)
```python
def process_list(items):
    items.append(999)
    print(f"Inside function: {items}")

my_list = [1, 2, 3]
print(f"Before: {my_list}")
process_list(my_list)
print(f"After: {my_list}")
```
**Use "Visualize Current File"** to see:
- All print statements in order
- Final state showing how function modified the list
- Understanding of mutable default arguments

## Use Cases

### For Students
- **Learning assignments** - Write complete programs and visualize them
- **Understanding references** - See which variables share data
- **Debugging logic errors** - Find where data becomes incorrect
- **Output verification** - See if program produces correct output

### For Educators
- **Teaching tool** - Show students how Python handles references
- **Assignment review** - Quickly visualize student code
- **Common mistakes** - Demonstrate shallow copy, mutable defaults, etc.

### For Developers
- **Quick debugging** - Visualize data structures during development
- **Code review** - Understand complex data relationships
- **Documentation** - Generate visual representations of data flow

## Troubleshooting

### Extension doesn't activate
- Make sure you're editing a `.py` file
- Check the Debug Console for errors

### "memory_graph package not found"
- Install it: `pip3 install memory_graph`
- Or check the custom Python path in settings

### "Graphviz not found"
- Install Graphviz using your system's package manager
- Verify with: `dot -V`

### Graph generation fails
- Check that your Python code is valid
- Remove any existing `mg.show()` or `mg.render()` calls (extension adds these automatically)
- Check the error message for details

### "Visualize Current File" shows no output
- Make sure your program has print statements if you want to see output
- Check that your code doesn't have syntax errors
- Look at the error section in the panel

## Development

### Building from Source
```bash
npm install
npm run compile
```

### Running in Debug Mode
Press `F5` in VS Code to launch the Extension Development Host

### Watch Mode
```bash
npm run watch
```

### Packaging
```bash
npm run package
```

## Project Status

**Completed Features:**
- Phase 1: Foundation and Python environment detection ✅
- Phase 2: Core visualization with webview integration ✅
- Phase 3.1: Complete file visualization for students ✅

**Future Enhancements (planned):**
- Phase 3.2: Checkpoint markers for step-by-step visualization
- Phase 3.3: Function call stack visualization
- Phase 3.4: Interactive step-through execution

## Contributing

This extension is part of the [memory_graph](https://github.com/Akshen/memory_graph) project. For issues or contributions, please visit the main repository.

## License

BSD 2-Clause License

## Credits

- Based on [memory_graph](https://pypi.org/project/memory-graph/) by Bas Terwijn
- Extension development: Akshen Doke
  - GitHub: [@Akshen](https://github.com/Akshen)
  - LinkedIn: [Akshen Doke](https://www.linkedin.com/in/akshen/)

## Learn More

- [memory_graph Documentation](https://github.com/Akshen/memory_graph)
- [Memory Graph Web Debugger](https://memory-graph.com/)
- [VS Code Extension API](https://code.visualstudio.com/api)
