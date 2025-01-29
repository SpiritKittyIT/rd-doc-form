import * as React from 'react'
import { FC } from 'react'

import { SPFI } from '@pnp/sp'
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid'
import { Checkbox, FormControlLabel } from '@mui/material'

import "@pnp/sp/items/get-all"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IListReminderTasksProps {
  sp: SPFI
  filterId: number
  isAdminOrGarant: boolean
  currentUserId: number
  hasTasksUpdate: () => void
  hasNewReminders: boolean
}

const ListReminderTasks: FC<IListReminderTasksProps> = (props) => {
  const [listItems, SetListItems] = React.useState<any[]>([])
  const [rows, SetRows] = React.useState<any[]>([])
  const [ListTitle, SetListTitle] = React.useState<string>('')
  const listId = 'f2b4ce34-b81a-472b-b546-b55d5d346e0b'

  const updateListItems = (): void => {
    props.sp.web.lists.getById(listId)
      .items.filter(`acColDokumentID eq '${props.filterId}' and (acColPripKategoria eq 'Pripomienkovanie' or acColPripKategoria eq 'Zapracovanie')`).select('*', 'acColPripOwner/Title').expand('acColPripOwner').getAll()
      .then((newListItems: any[]) => {
        SetListItems(newListItems.sort((a, b) => {return b['Id'] - a['Id']}))
      }).catch((error) => {
        console.error(error)
      })
  }

  const onTaskCheck = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean, params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>): void => {
    props.sp.web.lists.getById(listId).items.getById(params.row.id).update({['acColSplneneAN']: checked})
    .then((result) => {
      props.hasTasksUpdate()
    }).catch((error) => {
      console.error(error)
    })
  }

  const columns: GridColDef[] = [
    { field: 'acColPripKategoria', headerName: 'Kategória', disableColumnMenu: true, flex: 1, maxWidth: 200, resizable: true },
    { field: 'acColPripOwner', headerName: 'Vlastník', disableColumnMenu: true, flex: 1, maxWidth: 150, resizable: true },
    {
      field: 'acColSplneneAN', headerName: 'Splnená', disableColumnMenu: true, width: 100, resizable: true,
      renderCell: (params) => {
        const [checked, SetChecked] = React.useState<boolean>(params.row.acColSplneneAN)

        return (
          <>
            <FormControlLabel
              label={checked ? 'Áno' : 'Nie'}
              control={
                <Checkbox
                  disabled={!props.isAdminOrGarant && params.row.acColPripOwnerId !== props.currentUserId || (!props.isAdminOrGarant && checked) || (props.hasNewReminders && params.row.acColPripKategoria === 'Zapracovanie')}
                  checked={checked}
                  onChange={(event, checked) => {
                    SetChecked(checked)
                    onTaskCheck(event, checked, params)}
                  }
                />
              }
            />
          </>
        )
      }
    },
    {
      field: 'RemCount', headerName: 'Pripomienok', disableColumnMenu: true, width: 100, resizable: true,
      renderCell: (params) => {
        const [remCount, SetRemCount] = React.useState<number>()

        props.sp.web.lists.getById('9d780276-0371-4ea0-9cd2-52caf366c7bb')
        .items.filter(`acColDokumentID eq '${props.filterId}' and AuthorId eq ${params.row.acColPripOwnerId}`).select()()
        .then((newListItems: any[]) => {
          SetRemCount(newListItems.length)
        }).catch((error) => {
          console.error(error)
        })

        return (
          <>
            {params.row.acColPripKategoria === 'Pripomienkovanie' ? remCount : ''}
          </>
        )
      }
    },
    { field: 'acColPripDeadLine', headerName: 'Splniť Do', disableColumnMenu: true, flex: 1, maxWidth: 200, resizable: true },
  ]

  React.useEffect(() => {
    SetRows(
      listItems.map((listItem) => {
        const deadLineDate = new Date(listItem['acColPripDeadLine']?.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[0-9a-zA-Z:.-]*/, '$1'))
        deadLineDate.setHours(deadLineDate.getHours() + deadLineDate.getTimezoneOffset()/-60)
        let deadLineDateString: string = `${deadLineDate.getDate()}.${deadLineDate.getMonth() + 1}.${deadLineDate.getFullYear()}`
        if (!listItem['acColPripDeadLine']) {
          deadLineDateString = ''
        }

        return ({
          id: listItem['Id'],
          acColPripKategoria: listItem['acColPripKategoria'],
          acColPripOwner: listItem['acColPripOwner']['Title'],
          acColPripOwnerId: listItem['acColPripOwnerId'],
          acColSplneneAN: listItem['acColSplneneAN'],
          acColPripDeadLine: deadLineDateString
        })
      })
    )
  }, [listItems])

  React.useEffect(() => {
    updateListItems()
    
    props.sp.web.lists.getById(listId)()
      .then((PrilohyList) => {
        SetListTitle(PrilohyList.Title)
      }).catch((error) => {
        console.error(error)
      })
  }, [props])

  return (
    <div>
      <h2>{ListTitle}</h2>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        autoHeight
        disableRowSelectionOnClick
      />
    </div>
  )
}

export default ListReminderTasks
