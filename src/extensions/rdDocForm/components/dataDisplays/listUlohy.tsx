import * as React from 'react'
import { FC } from 'react'

import { SPFI, spfi } from '@pnp/sp'
import { AssignFrom } from '@pnp/core'
import { Box, Checkbox, List, ListItem, ListItemText, MenuItem, Paper, Select, Switch, TextField, Typography, Stack, FormControlLabel, Divider } from '@mui/material'

import "@pnp/sp/items/get-all"
import { ISiteUserInfo } from '@pnp/sp/site-users/types'
import { auditSiteUrl, LocaleStrings, ulohyListId } from '../RdDocForm'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IListUlohyProps {
  sp: SPFI
  dokumentId: number
  currentUser?: ISiteUserInfo
  ulohaTyp: 'Pripomienkovanie' | 'Schvalovanie' | 'Oboznamovanie'
  archived: boolean
}

interface IListUlohyItemProps {
  item: Record<string, any>
  index: number
  currentUser?: ISiteUserInfo
  onTaskCheck: (checked: boolean, taskId: number) => void
  pageSize: number
  page: number
  getAll: boolean
  archived: boolean
}

const ListUlohyItem: FC<IListUlohyItemProps> = (props) => {
  const [checked, SetChecked] = React.useState<boolean>(props.item['acSplnene'])

  return (
    <ListItem divider>
      {/* Title */}
      <ListItemText primary={props.item['acKoho']?.Title || 'N/A'} sx={{ flex: 2 }} />

      {/* Date */}
      <ListItemText
        primary={props.item['acTermin'] ? new Date(props.item['acTermin']).toLocaleDateString() : '-'}
        sx={{ flex: 2 }}
      />

      {/* Boolean Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            disabled={props.item['acKohoId'] !== props.currentUser?.Id || props.archived}
            checked={checked}
            onChange={(event, newChecked) => {
                SetChecked(newChecked)
                props.onTaskCheck(newChecked, props.item['Id'])
              }
            }
            sx={{
              "&:hover": {
                cursor: "pointer", // Make it clear that it's clickable
              },
            }}
          />
        }
        label={checked ? 'Áno' : 'Nie'}
        sx={{ flex: 2 }}
      />
      
    </ListItem>
  )
}

const ListUlohy: FC<IListUlohyProps> = (props) => {
  const pageSizes = [5, 10, 20, 50]

  const [auditSp, setAuditSp] = React.useState<SPFI>()
  const [listItems, setListItems] = React.useState<Record<string, any>[]>([])
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [getAll, setGetAll] = React.useState<boolean>(false)

  const getListItems = (all: boolean): void => {
    auditSp?.web.lists.getById(ulohyListId)
      .items.filter(`acDokId eq '${props.dokumentId}' and acUlohaTyp eq '${props.ulohaTyp}'${all ? `` : `and acKohoId eq ${props.currentUser?.Id}`}`)
      .select('*', 'acKoho/Title', 'acKoho/Id').expand('acKoho').orderBy('Id').getAll()
      .then((newListItems: Record<string, any>[]) => {
        setListItems(newListItems.sort((a, b) => {return b['Id'] - a['Id']}))
      }).catch((error) => {
        console.error('getListItems error:', error)
      })
  }

  const onTaskCheck = (checked: boolean, taskId: number): void => {
    auditSp?.web.lists.getById(ulohyListId).items.getById(taskId).update({['acSplnene']: checked})
    .then(() => {
      getListItems(getAll)
    }).catch((error) => {
      console.error(error)
    })
  }

  React.useEffect(() => {
    setAuditSp(spfi(auditSiteUrl).using(AssignFrom(props.sp.web)))
  }, [props])

  React.useEffect(() => {
    if (!auditSp) {return}
    getListItems(getAll)
  }, [auditSp])

  

  return (
    <Stack direction='column' spacing={1} >
      <Typography variant='h5' >{LocaleStrings.DataDisplays.TaskListTitle}</Typography>
      <Box>
        <Paper variant='outlined'>
          <Stack direction='column'>
            {/* List Items */}
            <List>
              <ListItem divider> {/* Header Item */}
                <ListItemText primary={'acKoho'} sx={{ flex: 2 }} />
                <ListItemText primary={'acTermin'} sx={{ flex: 2 }} />
                <ListItemText primary={'acSplnene'} sx={{ flex: 2 }} />
              </ListItem>
              {
                listItems.slice((page - 1) * pageSize, page * pageSize).map((item, index) => <ListUlohyItem key={item['Id']} item={item} index={index} currentUser={props.currentUser}
                  onTaskCheck={onTaskCheck} pageSize={pageSize} page={page} getAll={getAll} archived={props.archived} />)
              }
            </List>
          </Stack>

          {/* Pagination Controls */}
          <Stack direction='row' alignItems="center" justifyContent='right' spacing={1} padding={1}>
            {/* Page Size Dropdown */}
            <Box display="flex" alignItems="center" gap={1} margin='3px' sx={{ justifyContent: 'left' }}>
              <FormControlLabel control={
                <Switch
                  value={getAll}
                  onChange={(event, newValue) => {
                    setGetAll(newValue)
                    getListItems(newValue)
                  }}
                />
              } label={getAll ? 'Všetky' : 'Moje'} />
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
  )
}

export default ListUlohy
