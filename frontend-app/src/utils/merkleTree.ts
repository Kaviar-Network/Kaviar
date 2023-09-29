export class JsStorage {
  constructor(public db: { [key: string]: string } = {}) {}

  get(key: string) {
    return this.db[key];
  }

  getOrElement(key: string, defaultElement: string) {
    const element = this.db[key];
    if (element === undefined) {
      return defaultElement;
    } else {
      return element;
    }
  }

  put(key: string, value: string) {
    if (key === undefined || value === undefined) {
      throw Error("key or value is undefined");
    }
    this.db[key] = value;
  }

  del(key: string) {
    delete this.db[key];
  }

  putBatch(keyValues: { key: string; value: string }[]) {
    keyValues.forEach((element) => {
      this.db[element.key] = element.value;
    });
  }
}

export interface Hasher {
  hash(left: string, right: string): string;
}

interface Handler {
  handleIndex(i: number, currentIndex: number, siblingIndex: number): void;
}

export class MerkleTree {
  nLevels: number;
  prefix: string;
  hasher: Hasher;
  storage: JsStorage;
  zeroValues: string[];
  public totalElements: number;

  constructor(
    nLevels = 20,
    prefix: string,
    hasher: Hasher,
    storage = new JsStorage()
  ) {
    this.nLevels = nLevels;
    this.prefix = prefix;
    this.hasher = hasher;
    this.storage = storage;
    this.zeroValues = [];
    this.totalElements = 0;

    let currentZeroValue =
      "21663839004416932945382355908790599225266501822907911457504978515578255421292";
    this.zeroValues.push(currentZeroValue);
    for (let i = 0; i < nLevels; i++) {
      currentZeroValue = this.hasher.hash(currentZeroValue, currentZeroValue);
      this.zeroValues.push(currentZeroValue.toString());
    }
  }

  static indexToKey(prefix: string, level: number, index: number) {
    const key = `${prefix}_tree_${level}_${index}`;
    return key;
  }

  async root() {
    let root = await this.storage.getOrElement(
      MerkleTree.indexToKey(this.prefix, this.nLevels, 0),
      this.zeroValues[this.nLevels]
    );

    return root;
  }

  async path(index: number) {
    class PathTraverser {
      pathElements: string[];
      pathIndex: number[];
      prefix: string;
      storage: JsStorage;
      zeroValues: string[];
      constructor(prefix: string, storage: JsStorage, zeroValues: string[]) {
        this.prefix = prefix;
        this.storage = storage;
        this.zeroValues = zeroValues;
        this.pathElements = [];
        this.pathIndex = [];
      }

      async handleIndex(
        level: number,
        elementIndex: number,
        siblingIndex: number
      ) {
        const sibling = await this.storage.getOrElement(
          MerkleTree.indexToKey(this.prefix, level, siblingIndex),
          this.zeroValues[level]
        );
        this.pathElements.push(sibling);
        this.pathIndex.push(elementIndex % 2);
      }
    }
    index = Number(index);
    let traverser = new PathTraverser(
      this.prefix,
      this.storage,
      this.zeroValues
    );
    const root = await this.storage.getOrElement(
      MerkleTree.indexToKey(this.prefix, this.nLevels, 0),
      this.zeroValues[this.nLevels]
    );

    const element = await this.storage.getOrElement(
      MerkleTree.indexToKey(this.prefix, 0, index),
      this.zeroValues[0]
    );

    await this.traverse(index, traverser);
    return {
      root,
      pathElements: traverser.pathElements,
      pathIndex: traverser.pathIndex,
      element,
    };
  }

  async update(index: number, element: string, insert = false) {
    if (!insert && index >= this.totalElements) {
      throw Error("Use insert method for new elements.");
    } else if (insert && index < this.totalElements) {
      throw Error("Use update method for existing elements.");
    }
    try {
      class UpdateTraverser {
        keyValuesToPut: { key: string; value: string }[];
        originalElement: string = "";
        constructor(
          public prefix: string,
          public storage: JsStorage,
          public hasher: Hasher,
          public currentElement: string,
          public zeroValues: string[]
        ) {
          this.prefix = prefix;
          this.storage = storage;
          this.hasher = hasher;
          this.currentElement = currentElement;
          this.zeroValues = zeroValues;
          this.keyValuesToPut = [];
        }

        async handleIndex(
          level: number,
          elementIndex: number,
          siblingIndex: number
        ) {
          if (level == 0) {
            this.originalElement = await this.storage.getOrElement(
              MerkleTree.indexToKey(this.prefix, level, elementIndex),
              this.zeroValues[level]
            );
          }
          const sibling = await this.storage.getOrElement(
            MerkleTree.indexToKey(this.prefix, level, siblingIndex),
            this.zeroValues[level]
          );
          let left, right;
          if (elementIndex % 2 == 0) {
            left = this.currentElement;
            right = sibling;
          } else {
            left = sibling;
            right = this.currentElement;
          }

          this.keyValuesToPut.push({
            key: MerkleTree.indexToKey(this.prefix, level, elementIndex),
            value: this.currentElement,
          });
          this.currentElement = this.hasher.hash(left, right);
        }
      }
      let traverser = new UpdateTraverser(
        this.prefix,
        this.storage,
        this.hasher,
        element,
        this.zeroValues
      );

      await this.traverse(index, traverser);
      traverser.keyValuesToPut.push({
        key: MerkleTree.indexToKey(this.prefix, this.nLevels, 0),
        value: traverser.currentElement,
      });

      await this.storage.putBatch(traverser.keyValuesToPut);
    } catch (e) {
      console.error(e);
    }
  }

  async insert(element: string) {
    const index = this.totalElements;
    await this.update(index, element, true);
    this.totalElements++;
  }

  async traverse(index: number, handler: Handler) {
    let currentIndex = index;
    for (let i = 0; i < this.nLevels; i++) {
      let siblingIndex = currentIndex;
      if (currentIndex % 2 == 0) {
        siblingIndex += 1;
      } else {
        siblingIndex -= 1;
      }
      await handler.handleIndex(i, currentIndex, siblingIndex);
      currentIndex = Math.floor(currentIndex / 2);
    }
  }

  getIndexByElement(element: string) {
    for (let i = this.totalElements - 1; i >= 0; i--) {
      const elementFromTree = this.storage.get(
        MerkleTree.indexToKey(this.prefix, 0, i)
      );
      if (elementFromTree === element) {
        return i;
      }
    }
    return false;
  }
}
