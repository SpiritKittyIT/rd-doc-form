import { SPFI } from "@pnp/sp"

import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'
import '@pnp/graph/groups'
import '@pnp/sp/profiles'

import { IListItemFormUpdateValue } from "@pnp/sp/lists"
import { IWebEnsureUserResult } from '@pnp/sp/site-users/types'
import { MSGraphClientV3 } from '@microsoft/sp-http'
import { FormCustomizerContext } from "@microsoft/sp-listview-extensibility"

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

export async function ValidateUpdateMemberMultiField(memberMultiFields: {fieldName: string, fieldValue: number[]}[], sp: SPFI): Promise<IListItemFormUpdateValue[]> {
  const validateUpdateItem: IListItemFormUpdateValue[] = []

  let Users: {id: number, loginName: string}[] = []
  let Groups: {id: number, loginName: string}[] = []

  await sp.web.siteUsers.select('*')().then((users) => {
    Users = users.map((member) => {
      return {id: member.Id, loginName: member.LoginName}
    })
  }).catch((error) => {
    console.error(error)
  })
  
  await sp.web.siteGroups.select('*')().then((groups) => {
    Groups = groups.map((member) => {
      return {id: member.Id, loginName: member.LoginName}
    })
  }).catch((error) => {
    console.error(error)
  })

  const Members: {id: number, loginName: string}[] = Users.concat(Groups)
  const getMember = (id: number): string => {
    for (let index = 0; index < Members.length; index++) {
      if (Members[index].id === id) {
        return Members[index].loginName
      }
    }
    return ''
  }

  memberMultiFields.forEach((field) => {
    const loginNames: string[] = []
    field.fieldValue?.forEach((id) => {
      const loginName = getMember(id)
      if (loginName) {
        loginNames.push(loginName)
      }
    })
    validateUpdateItem.push({FieldName: field.fieldName, FieldValue: JSON.stringify(loginNames.map((loginName) => {return {'Key': loginName}}))})
  })
  
  return validateUpdateItem
}

export async function getSiteUsersAndGroups(sp: SPFI, context: FormCustomizerContext, includeGroups: boolean, filter: string = ''): Promise<IMember[]> {
  try {
    const members: IMember[] = []
    const client: MSGraphClientV3 = await context.msGraphClientFactory.getClient('3')

    const requests: Promise<IWebEnsureUserResult>[] = []

    // Fetch users
    const userFilterQuery = filter ? `startswith(displayName, '${filter}')` : ''
    const usersResponse = await client.api(`/users`).filter(userFilterQuery).top(20).get()

    for (const user of usersResponse.value) {
      const loginName = 'i:0#.f|membership|' + user.userPrincipalName;
      requests.push(sp.web.ensureUser(loginName))
    }

    // Fetch groups if includeGroups is true
    if (includeGroups) {
      const groupFilterQuery = filter ? `startswith(displayName, '${filter}')` : ''
      const groupsResponse = await client.api(`/groups`).filter(groupFilterQuery).top(20).get()

      for (const group of groupsResponse.value) {
        const loginName = 'c:0o.c|federateddirectoryclaimprovider|' + group.id;
        requests.push(sp.web.ensureUser(loginName))
      }
    }

    for (const request of requests) {
      try {
        const result = await request
        members.push({id: result.data.Id, name: result.data.Title})
      } catch (err) {
        console.error(err)
      }
    }

    return members.sort((a, b) => a.name.localeCompare(b.name) )
  } catch (error) {
    console.error('Error fetching site users or groups:', error)
  }

  return []
}

export const getUserOrGroupById = async (sp: SPFI, id: number): Promise<IMember | undefined> => {
  try {
    // Try fetching as a User
    const user = await sp.web.siteUsers.getById(id)()
    return { id: id, name: user.Title }
  } catch (errU) {
    console.error(errU)
    try {
      // If user not found, try fetching as a Group
      const group = await sp.web.siteGroups.getById(id)()
      return { id: id, name: group.Title }
    } catch (errG) {
      console.error(errG)
    }
  }
}
