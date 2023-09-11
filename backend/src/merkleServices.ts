import { MerkleTree } from "./utils/merkleTree"


export async function deposit (commitment: string, tree: MerkleTree){
    try{
        await tree.insert(commitment);
        console.log(tree);
        return tree;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function withdraw(leafIndex: number, tree: MerkleTree){
    try{
        const { root, path_elements, path_index } = await tree.path(
            leafIndex
       );
       return {
        "root": root,
        "path_elements": path_elements,
        "path_index": path_index
       }
    } catch (error) {
        console.log(error);
        return error;
    }
    
}
