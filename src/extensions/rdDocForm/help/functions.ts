import { SPFI } from "@pnp/sp"

import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'
import '@pnp/graph/groups'

export function Contains<A,V>(arr: A[], val: V, getVal: (x: A) => V = (x: A) => {return x as unknown as V}): boolean {
  for (const arrItem of arr){
    if (getVal(arrItem) === val) {return true}
  }
  return false
}

export async function EnsureFolder(listId: string, folderName: string, sp: SPFI): Promise<void> {
  let exists: boolean = false
  await sp.web.lists.getById(listId).rootFolder.folders.getByUrl(folderName)()
  .then((folder) => {exists = true})
  .catch((error) => {
    console.error(error)
  })

  if (!exists){
    sp.web.lists.getById(listId).rootFolder.addSubFolderUsingPath(folderName)
    .catch((error) => {
      console.error(error)
    })
  }
}
