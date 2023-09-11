class GenericStorage {
    constructor(getStorage = () => window.localStorage) {
      this.storage = getStorage()
    }
  
    get(key) {
      return this.storage.getItem(key)
    }
  
    set(key, value) {
      this.storage.setItem(key, value)
    }
  
    clearItem(key) {
      this.storage.removeItem(key)
    }
  
    clearItems(keys) {
      keys.forEach(key => this.clearItem(key))
    }
  }
  
  export class LocalMerkleTree extends GenericStorage {
    constructor() {
      super()
    }
  
    get(key) {
      return this.get(key)
    }
  
    getMerkleTreeOrDefault(key, defaultEl) {
      const el = this.get(key)
      if (el === null) {
        return defaultEl
      } else {
        return el
      }
    }
  
    setMerkleTree(key, value) {
      this.set(key, value)
    }
  
    clear(key) {
      this.clearItems([key])
    }
  
    setBatch(key_values) {
      key_values.forEach(el => {
        this.set(el.key, el.value)
      })
    }
  }
  