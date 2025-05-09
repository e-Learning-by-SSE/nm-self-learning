export interface TreeNode {
    value: string
    children: TreeNode[]
    isLeaf?: boolean
    text?: string
  }
  
  export function parseTree(input: string): TreeNode | null {
    let pos = 0
  
    function parseNode(): TreeNode | null {

      // Skip whitespace characters
      while (pos < input.length && /\s/.test(input[pos])) pos++

      // If end of input is reached, return null
      if (pos >= input.length) return null
  
      // Check for the opening bracket '['
      if (input[pos] !== "[") {
        throw new Error(`Expected '[' at position ${pos}`)
      }
      pos++
  
      // Skip any whitespace characters after the opening bracket
      while (pos < input.length && /\s/.test(input[pos])) pos++
  
      // Parse the node value, which consists of alphanumeric characters and underscores
      let value = ""
      while (pos < input.length && /[A-Za-z0-9_äüöÄÖÜß]/.test(input[pos])) {
        value += input[pos]
        pos++
      }
      
      // If no value is found, throw an error
      if (!value) {
        throw new Error(`Expected node value at position ${pos}`)
      }
  
      // Parse the text content of the node
      let text = ""
      let textBuffer = ""
      while (pos < input.length && input[pos] !== "[" && input[pos] !== "]") {
        textBuffer += input[pos]
        pos++
      }
  
     // Trim any leading or trailing whitespace from the text
      text = textBuffer.trim()
      
      // Initialize an array to hold child nodes
      const children: TreeNode[] = []
  
      if (text) {
        children.push({
          value: text,
          children: [],
          isLeaf: true,
        })
      }
  
  
      while (pos < input.length && input[pos] !== "]") {
        const child = parseNode()
        if (child) {
          children.push(child)
        }
  
        while (pos < input.length && /\s/.test(input[pos])) pos++
      }
  
      if (pos >= input.length || input[pos] !== "]") {
        throw new Error(`Expected ']' at position ${pos}`)
      }
      pos++
  
      return {
        value,
        children,
        isLeaf: children.length === 0,
      }
    }
  
      return parseNode()
    
  }
  
  export function validateBrackets(input: string): boolean {
    let count = 0
  
    for (const char of input) {
      if (char === "[") count++
      if (char === "]") count--
      if (count < 0) return false
    }
  
    return count === 0
  }
  
  