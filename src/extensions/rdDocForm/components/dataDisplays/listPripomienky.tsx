import * as React from 'react'
import { FC } from 'react'

import { SPFI, spfi } from '@pnp/sp'
import { AssignFrom } from '@pnp/core'
import { Box, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography, Stack, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

import "@pnp/sp/items/get-all"
import { ISiteUserInfo } from '@pnp/sp/site-users/types'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddIcon from '@mui/icons-material/Add'
import { LocaleStrings } from '../RdDocForm'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IListPripomienkyProps {
  sp: SPFI
  dokumentId: number
  currentUser?: ISiteUserInfo
  archived: boolean
}

interface IListPripomienkyItemProps {
  item: Record<string, any>
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>
  setPripomItem: React.Dispatch<React.SetStateAction<Record<string, any> | undefined>>
}

const ListPripomienkyItem: FC<IListPripomienkyItemProps> = (props) => {
  return (
    <ListItem divider>
      <Stack direction='row' sx={{ flex: 0.4 }} >
        <IconButton title='Upraviť' color='primary' sx={{ border: '2px solid', borderRadius: 2, width: 26, height: 26 }} size='small' onClick={(event) => {
          props.setShowDialog(true)
          props.setPripomItem(props.item)
        }}>
          <EditOutlinedIcon />
        </IconButton>
      </Stack>

      {/* Title */}
      <ListItemText
        primary={
          <Typography noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {props.item["Title"]}
          </Typography>
        }
        sx={{ flex: 1.9 }}
      />
      <Box sx={{ flex: 0.1 }} />

      {/* Date */}
      <ListItemText
        primary={props.item['acPripomStav']}
        sx={{ flex: 1.9 }}
      />
      <Box sx={{ flex: 0.1 }} />

      {/* Date */}
      <ListItemText
        primary={props.item['Author']['Title']}
        sx={{ flex: 2 }}
      />      
    </ListItem>
  )
}

const ListPripomienky: FC<IListPripomienkyProps> = (props) => {
  const auditSiteUrl: string = 'https://servisac.sharepoint.com/sites/acRdAudit'
  const listId = '9fda23eb-cfec-40f1-9f66-500d41c0a898'
  const pageSizes = [5, 10, 20, 50]
  const pripomChoices = ['', 'Nezapracované', 'Zapracované', 'Zamietnuté']

  const [auditSp, setAuditSp] = React.useState<SPFI>()
  const [listItems, setListItems] = React.useState<Record<string, any>[]>([])
  const [page, setPage] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [pripomStav, setPripomStav] = React.useState<string>('')
  const [showDialog, setShowDialog] = React.useState<boolean>(false)
  const [pripomItem, setPripomItem] = React.useState<Record<string, any>>()

  const getListItems = (stav: string): void => {
    auditSp?.web.lists.getById(listId)
      .items.filter(`acDokId eq '${props.dokumentId}'${stav === '' ? `` : ` and acPripomStav eq '${stav}'`}`)
      .select('*', 'Author/Title').expand('Author').orderBy('Id').getAll()
      .then((newListItems: Record<string, any>[]) => {
        setListItems(newListItems.sort((a, b) => {return b['Id'] - a['Id']}))
      }).catch((error) => {
        console.error('getListItems error:', error)
      })
  }

  const onPripoSave = (): void => {
    if (!pripomItem) { return }
    if (pripomItem['Id'] === undefined) {
      auditSp?.web.lists.getById(listId).items.add(pripomItem)
      .then(() => {
      }).catch((error) => {
        console.error(error)
      })
      return
    }
    auditSp?.web.lists.getById(listId).items.getById(pripomItem['Id']).update(
      {
        ['acPripomStav']: pripomItem['acPripomStav'],
        ['Title']: pripomItem['Title']
      }
    )
    .then(() => {
    }).catch((error) => {
      console.error(error)
    })
  }

  React.useEffect(() => {
    setAuditSp(spfi(auditSiteUrl).using(AssignFrom(props.sp.web)))
  }, [props])

  React.useEffect(() => {
    if (!auditSp) {return}
    getListItems(pripomStav)
  }, [auditSp])

  return (
    <>
      <Dialog
        open={showDialog}
        onClose={() => {setShowDialog(false)}}
      >
        <DialogTitle>
          {pripomItem && pripomItem['Id'] === undefined ? 'Nová pripomienka' : LocaleStrings.DataDisplays.SuggestionEditTitle}
        </DialogTitle>
        <DialogContent sx={{ width: 400 }}>
          <Stack direction='column' spacing={2} >
            <TextField
              disabled={pripomItem && pripomItem['Id'] === undefined ? false : true}
              value={pripomItem ? pripomItem['Title'] : ''}
              multiline
            />
            <Select
              disabled={props.archived}
              value={pripomItem ? pripomItem['acPripomStav'] : ''}
              onChange={(event) => {
                setPripomItem({
                  ...pripomItem,
                  ['acPripomStav']: event.target.value
                })
              }}
              size="small"
            >
              {pripomChoices.map((choice) => (
                <MenuItem key={choice} value={choice}>
                  {choice === '' ? '-' : choice}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowDialog(false)}}>{LocaleStrings.Buttons.DialogClose}</Button>
          {
            !props.archived &&
            <Button onClick={() => {
              setShowDialog(false)
              onPripoSave()
            }}>
              {LocaleStrings.DataDisplays.SuggestionDialogSave}
            </Button>
          }
        </DialogActions>
      </Dialog>
      <Stack direction='column' spacing={1} >
        <Stack direction='row' spacing={2} >
          <Typography variant='h5' >{LocaleStrings.DataDisplays.SuggestionListTitle}</Typography>
          {
            !props.archived &&
            <IconButton
              title={'Nová pripomienka'}
              size='small'
              color='primary'
              sx={{ border: '2px solid', borderRadius: 2, width: 26, height: 26 }}
              onClick={(event) => {
                setPripomItem({ ['acDokId']: props.dokumentId })
                setShowDialog(true)
            }}>
              <AddIcon />
            </IconButton>
          }
        </Stack>
        <Box>
          <Paper variant='outlined'>
            <Stack direction='column'>
              {/* List Items */}
              <List>
                <ListItem divider> {/* Header Item */}
                  <ListItemText primary={''} sx={{ flex: 0.4 }} />
                  <ListItemText primary={'Title'} sx={{ flex: 2 }} />
                  <ListItemText primary={'acPripomStav'} sx={{ flex: 2 }} />
                  <ListItemText primary={'Author'} sx={{ flex: 2 }} />
                </ListItem>
                {
                  listItems.slice((page - 1) * pageSize, page * pageSize).map((item, index) =>
                    <ListPripomienkyItem key={item['Id']} item={item} setPripomItem={setPripomItem} setShowDialog={setShowDialog} />
                  )
                }
              </List>
            </Stack>

            {/* Pagination Controls */}
            <Stack direction='row' alignItems="center" justifyContent='right' spacing={1} padding={1}>
              {/* State Filter */}
              <Box display="flex" alignItems="center" gap={1} margin='3px'>
                <Typography>{LocaleStrings.DataDisplays.SuggestionStateFilter}</Typography>
                <Select
                  value={pripomStav}
                  onChange={(event) => {
                    getListItems(event.target.value)
                    setPripomStav(event.target.value)
                  }}
                  size="small"
                  sx={{ width: 80 }}
                >
                  {pripomChoices.map((choice) => (
                    <MenuItem key={choice} value={choice}>
                      {choice === '' ? '-' : choice}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Divider orientation='vertical' flexItem  />

              {/* Page Input */}
              <Box display="flex" alignItems="center" gap={1} margin='3px'>
                <Typography>{LocaleStrings.DataDisplays.ListPage}</Typography>
                <TextField
                  type="number"
                  value={page}
                  onChange={(event) => {
                    const newPageNumber = +event.target.value > 0 ? +event.target.value : 1
                    setPage(newPageNumber)
                  }}
                  size="small"
                  sx={{ width: 60 }}
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Divider orientation='vertical' flexItem  />

              {/* Page Size Dropdown */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{LocaleStrings.DataDisplays.ListPageSize}</Typography>
                <Select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(+event.target.value)
                  }}
                  size="small"
                  sx={{ width: 80 }}
                >
                  {pageSizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </>
  )
}

export default ListPripomienky
