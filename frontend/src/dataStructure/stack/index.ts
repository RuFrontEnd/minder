// Define a generic Stack class
class Stack<T> {
    private items: T[];
    private limit: number;
  
    constructor(limit?:number) {
      this.items = [];
      this.limit = limit || Infinity
    }
  
    /**
     * Adds an element to the top of the stack
     * @param element The element to be added
     */
    push(element: T): void {
      if(this.items.length === this.limit){
        this.items.splice(0, 1)
      }
      this.items.push(element);
    }
  
    /**
     * Removes and returns the top element from the stack
     * @returns The removed element, or undefined if the stack is empty
     */
    pop(): T | undefined {
      return this.items.pop();
    }
  
    /**
     * Returns the top element without removing it
     * @returns The top element, or undefined if the stack is empty
     */
    peek(): T | undefined {
      return this.items[this.items.length - 1];
    }
  
    /**
     * Checks if the stack is empty
     * @returns true if the stack is empty, otherwise false
     */
    isEmpty(): boolean {
      return this.items.length === 0;
    }
  
    /**
     * Returns the number of elements in the stack
     * @returns The size of the stack
     */
    size(): number {
      return this.items.length;
    }
  
    /**
     * Clears all elements from the stack
     */
    clear(): void {
      this.items = [];
    }
  
    /**
     * Converts the stack to a string representation
     * @returns A string representation of the stack
     */
    toString(): string {
      return this.items.toString();
    }
  }

  export default Stack;
  