import * as React from 'react'
import { FC } from 'react'

import { SPFI } from '@pnp/sp'
import { DataGrid, GridCellParams, GridColDef, GridTreeNodeWithRender } from '@mui/x-data-grid'
import { Button, Dialog, DialogContent, IconButton, Stack, SxProps, Theme } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import { Contains } from '../../help/helperFunctions'

import "@pnp/sp/items/get-all"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IListRemindersProps {
  sp: SPFI
  filterId: number
  newEnabled: boolean
  setHasNew: (hasNew: boolean) => void
}

const ListReminders: FC<IListRemindersProps> = (props) => {
  const [listItems, SetListItems] = React.useState<any[]>([])
  const [rows, SetRows] = React.useState<any[]>([])
  const [ListTitle, SetListTitle] = React.useState<string>('')
  const [show, setShow] = React.useState<boolean>(false)
  const [dialogSrc, SetDialogSrc] = React.useState<string>('')
  const listId = '9d780276-0371-4ea0-9cd2-52caf366c7bb'
  const contentTypeId = '0x0100A66B0351EC2CC9459ACF2F07B405D4DD0500F68E1B8F4D387A48915365658DBB9F75'
  const rootFolder = '%2Fsites%2FacRd%2FLists%2FacLstStrukPripomienky'

  const path: string = `${window.location.protocol}//${window.location.host}${window.location.pathname}`

  const updateListItems = (): void => {
    props.sp.web.lists.getById(listId)
      .items.filter("acColDokumentID eq '" + props.filterId + "'").select('*', 'Author/Title').expand('Author').getAll()
      .then((newListItems: any[]) => {
        SetListItems(newListItems.sort((a, b) => {return b['Id'] - a['Id']}))
        props.setHasNew(newListItems.filter((li) => {return !Contains(['Zapracovaná', 'Nezapracovaná'], li['acColStavPripomienky'])}).length > 0)
      }).catch((error) => {
        console.error(error)
      })
  }

  const rowButtonProps = (color: string): SxProps<Theme> => {
    return {color: color, border: `solid 2px ${color}`, borderRadius: 2, width: 26, height: 26}
  }

  const columns: GridColDef[] = [
    {
      field: 'buttons', headerName: '', sortable: false, width: 120,
      renderCell: (params) => {
        return (
          <>
            <div style={{width: '100%'}} className='preview'>
              <Stack direction='row' spacing={0.5} >
                <IconButton title='Zobraziť' sx={rowButtonProps('var(--blue)')} size='small' onClick={(event) => {
                  SetDialogSrc(`${path}?PageType=4&List=${listId}&ID=${params.row.id}&ContentTypeId=${contentTypeId}&RootFolder=${rootFolder}`)
                  setShow(true)
                }}>
                  <VisibilityOutlinedIcon />
                </IconButton>
                <IconButton title='Upraviť' sx={rowButtonProps('var(--yellow)')} size='small' onClick={(event) => {
                  SetDialogSrc(`${path}?PageType=6&List=${listId}&ID=${params.row.id}&ContentTypeId=${contentTypeId}&RootFolder=${rootFolder}`)
                  setShow(true)
                }}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton title='Zapracovať' sx={rowButtonProps('var(--purple)')} size='small' onClick={(event) => {
                  SetDialogSrc(`${path}?PageType=6&FormType=1&List=${listId}&ID=${params.row.id}&ContentTypeId=${contentTypeId}&RootFolder=${rootFolder}`)
                  setShow(true)
                }}>
                  <EditNoteOutlinedIcon />
                </IconButton>
              </Stack>
            </div>
          </>
        )
      }
    },
    {
      field: 'acColStavPripomienky', headerName: 'Stav', disableColumnMenu: true, width: 52,
      renderCell: (params) => {
        let icon = <PriorityHighOutlinedIcon titleAccess={params.value} />
        if(params.value === 'Zapracovaná'){icon = <CheckOutlinedIcon titleAccess={params.value} />}
        if(params.value === 'Nezapracovaná'){icon = <CloseOutlinedIcon titleAccess={params.value} />}
        return (
          <div style={{width: '100%'}} className='preview'>
            {icon}
          </div>
        )
      },
      cellClassName: (params: GridCellParams<any, any, any, GridTreeNodeWithRender>) => {
        let className: string = 'yellow'
        if(params.value === 'Zapracovaná'){className = 'green'}
        if(params.value === 'Nezapracovaná'){className = 'red'}
        return className
      }
    },
    { field: 'Modified', headerName: 'Zapracované', disableColumnMenu: true, flex: 1, maxWidth: 110, resizable: true },
    { field: 'Author', headerName: 'Vytvoril', disableColumnMenu: true, flex: 1, maxWidth: 150, resizable: true },
    { field: 'acColPoznPripomienkovatela', headerName: 'Poznámky pripomienkovateľa', disableColumnMenu: true, flex: 1, resizable: true },
  ]

  React.useEffect(() => {
    SetRows(
      listItems.map((listItem) => {
        const modifiedDate = new Date(listItem['Modified']?.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[0-9a-zA-Z:.-]*/, '$1'))
        modifiedDate.setHours(modifiedDate.getHours() + modifiedDate.getTimezoneOffset()/-60)
        const modifiedDateString: string = `${modifiedDate.getDate()}.${modifiedDate.getMonth() + 1}.${modifiedDate.getFullYear()}`
        
        return ({
          id: listItem['Id'],
          buttons: '',
          acColStavPripomienky: listItem['acColStavPripomienky'],
          Modified: Contains(['Zapracovaná', 'Nezapracovaná'], listItem['acColStavPripomienky']) ? modifiedDateString : '',
          Author: listItem['Author']['Title'],
          acColPoznPripomienkovatela: listItem['acColPoznPripomienkovatela']
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

  const hideDialog = (): void => {
    setShow(false)
    updateListItems()
  }

  return (
    <div>
      <Stack direction='row' spacing={2}>
        <h2>{ListTitle}</h2>
        <div className='stack-div'>
          <Button variant='contained' size='small' color='warning' disabled={!props.newEnabled} onClick={() => {
            if (!props.newEnabled) {return}
            SetDialogSrc(`${path}?PageType=8&List=${listId}&acColDokumentID=${props.filterId}&ContentTypeId=${contentTypeId}&RootFolder=${rootFolder}`)
            setShow(true)
          }}>
            Nová pripomienka
          </Button>
        </div>
      </Stack>
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
      <Dialog
        open={show}
        onClose={() => {hideDialog()}}
      >
        <DialogContent className='preview' sx={{width: '20rem', height: '25rem'}}>
          <iframe style={{width: 'inherit', height: 'inherit', border: 'none'}} src={dialogSrc} onLoad={(event) => {
            if (event.currentTarget.contentWindow.location.toString() !== dialogSrc) {
              hideDialog()
            }
          }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ListReminders
