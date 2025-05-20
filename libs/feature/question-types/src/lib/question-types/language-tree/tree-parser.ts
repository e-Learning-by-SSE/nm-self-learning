export interface TreeNode {
    value: string
    children: TreeNode[]
    isLeaf?: boolean
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
  
      
      // Initialize an array to hold child nodes
      const children: TreeNode[] = []
  
  
      while (pos < input.length && input[pos] !== "]") {
        while (pos < input.length && /\s/.test(input[pos])) pos++
  
        if (pos < input.length && input[pos] === "[") {
          const child = parseNode()
          if (child) children.push(child)
        } else if (pos < input.length && input[pos] !== "]") {
          throw new Error(`Unexpected inline text at position ${pos}. Expected '[' or ']'`)
        }
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

  