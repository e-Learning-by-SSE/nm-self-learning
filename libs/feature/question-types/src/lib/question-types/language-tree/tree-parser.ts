export interface TreeNode {
    value: string
    children: TreeNode[]
    isLeaf?: boolean
    text?: string
  }
  
  export function parseTree(input: string): TreeNode | null {
    let pos = 0
  
    function parseNode(): TreeNode | null {
 
      while (pos < input.length && /\s/.test(input[pos])) pos++
  
      if (pos >= input.length) return null
  

      if (input[pos] !== "[") {
        throw new Error(`Expected '[' at position ${pos}`)
      }
      pos++
  
    
      while (pos < input.length && /\s/.test(input[pos])) pos++
  
  
      let value = ""
      while (pos < input.length && /[A-Za-z0-9_]/.test(input[pos])) {
        value += input[pos]
        pos++
      }
  
      if (!value) {
        throw new Error(`Expected node value at position ${pos}`)
      }
  
     
      let text = ""
      let textBuffer = ""
      while (pos < input.length && input[pos] !== "[" && input[pos] !== "]") {
        textBuffer += input[pos]
        pos++
      }
  
     
      text = textBuffer.trim()
  
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
  
    try {
      return parseNode()
    } catch (error) {
      throw error
    }
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
  
  