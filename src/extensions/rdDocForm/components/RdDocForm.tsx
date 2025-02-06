import * as React from 'react'
import { FormDisplayMode, Log } from '@microsoft/sp-core-library'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility'
import { ITheme } from '@fluentui/react'
import { SPFI } from '@pnp/sp'

import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'
import '@pnp/sp/files'
import '@pnp/sp/folders'
import { EnsureFolder } from '../help/functions'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Paper, Stack, Tab, Tabs } from '@mui/material'
import HeaderDisplay from './dataDisplays/headerDisplay'
import { TabPanel, tabProps } from './dataDisplays/tabPanel'
import { DateCard, NumberCard, PeopleCard, SelectCard, TextCard } from './cards'
import { getLangStrings, ILang } from '../loc/langHelper'
import ListAttachments from './dataDisplays/listAttachments'
import { ISiteUserInfo } from '@pnp/sp/site-users/types'
import ListUlohy from './dataDisplays/listUlohy'
import ListPripomienky from './dataDisplays/listPripomienky'

export enum DocLib {
  Rozpracovane = '16e60be6-ef8f-4477-9c2b-3ea1ada91468',
  Platne = 'a19374d6-b9bd-49ca-a808-a73085a7afc6',
  Archivne = '50f7f4f0-8a38-4890-acf9-a92887454ad7'
}

export interface IRdDocFormProps {
  context: FormCustomizerContext
  displayMode: FormDisplayMode
  onSave: (item: Record<string, any>) => Promise<void>
  onClose: () => void
  formSubmit: (
    sp: SPFI,
    item: Record<string, any>,
    listGuid: string,
    displayMode: FormDisplayMode,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setDialog: React.Dispatch<React.SetStateAction<boolean>>,
    onSave: (item: {}, etag?: string) => Promise<void>
  ) => Promise<void>
  theme: ITheme
  sp: SPFI
}

export const LocaleStrings: ILang = getLangStrings('sk')

const LOG_SOURCE: string = 'RdDocForm'
export const PrilohyListId: string = '7d968a1b-aab4-4294-af58-5d401e887779'

/*enum ValType {
  BASE,
  LOOKUP,
  PERSON
}*/

const RdDocForm: React.FC<IRdDocFormProps> = (props) => {
  Log.info(LOG_SOURCE, 'React Element: RdDocForm started')

  //#region DEFINITIONS
  /*const [renderSignal, setRenderSignal] = React.useState<boolean>(false)
  const reRender = () => { setRenderSignal(!renderSignal) }*/
  const [item, setItem] = React.useState<Record<string, any>>(props.context.item ?? {})
  const [colProps, setColProps] = React.useState<Record<string, IColProps>>({})
  const [dialog, setDialog] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  const [libName, setLibName] = React.useState<string>('')
  const [fileName, setFileName] = React.useState<string>('')
  const [sourcePage, setSourcePage] = React.useState<string>('')
  const [currentUser, setCurrentUser] = React.useState<ISiteUserInfo>()
  const [docLib, setDocLib] = React.useState<DocLib>(DocLib.Rozpracovane)
  const [displayMode, setDisplayMode] = React.useState<FormDisplayMode>(FormDisplayMode.Display)

  /*const valSet = (value: any, valName: string, valType: ValType = ValType.BASE): void => {
    switch (valType) {
      case ValType.LOOKUP:
        setItem({
          ...item,
          [valName]: value ? +value : null,
        })
        break
      case ValType.PERSON:
        setItem({
          ...item,
          [`${valName}Id`]: value ? +value : null,
          [`${valName}StringId`]: value ? `${value}` : '',
        })
        break
      default:
        setItem({
          ...item,
          [valName]: value,
        })
    }
  }*/

  const [tabVal, setTabVal] = React.useState(0)
  const handleChange = (event: React.SyntheticEvent, newTabVal: number): void => {
    setTabVal(newTabVal)
  }

  const handleSubmit: (event: React.FormEvent<HTMLButtonElement>) => void = async (event) => {
    await props.formSubmit(props.sp, item, props.context.list.guid.toString(), displayMode, setErrorMessage, setDialog, props.onSave)
  }
  //#endregion

  //#region ON_LOAD
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href)
    setSourcePage(urlParams?.get('Source') ?? '')

    const currentDocLib = props.context.list.guid.toString() as DocLib
    setDocLib(currentDocLib)
    if (currentDocLib === DocLib.Rozpracovane) {
      setDisplayMode(props.displayMode)
    }

    const removeFields = ['@odata.context', '@odata.editLink', '@odata.metadata', '@odata.etag', '@odata.id', '@odata.type',
      'OData__ColorTag', 'OData__dlc_DocId', 'OData__dlc_DocIdUrl', 'OData__CopySource', 'OData__UIVersionString',
      'MediaServiceImageTags', 'MediaServiceOCR', 'acColButtons']

    // ensure prilohy folder
    if (displayMode !== FormDisplayMode.New ) {
      const tmpItem = item
      removeFields.forEach(removeField => {
        delete tmpItem[removeField]
      })
      setItem(tmpItem)

      EnsureFolder(PrilohyListId, `${item['Id']}`, props.sp)
      .catch((error) => {
        console.error(error)
      })

      props.sp.web.currentUser().then((user) => {
        setCurrentUser(user)
      }).catch((error) => {
        console.error(error)
      })
    }

    // set col props
    props.sp.web.lists.getById(props.context.list.guid.toString()).fields.filter('Hidden eq false')()
    .then((fieldsInfo) => {
      const newColProps: Record<string, IColProps> = {}

      for (const fieldInfo of fieldsInfo){
        if (removeFields.indexOf(fieldInfo.InternalName) !== -1) {
          continue
        }

        newColProps[fieldInfo.InternalName] = fieldInfo
      }

      setColProps(newColProps)
    })
    .catch(err => {
      console.error(err)
    })

    //set lib name
    props.sp.web.lists.getById(props.context.list.guid.toString())().then((list) => {
      setLibName(list.Title)
    }).catch((error) => {
      console.error(error)
    })

    props.sp.web.lists.getById(props.context.list.guid.toString()).items.getById(item['Id']).select('File/Name', 'File/Title').expand('File')().then((res) => {
      setFileName(res['File']['Name'])
      if (!item['Title']) {
        setItem({
          ...item,
          ['Title']: res['File']['Title']
        })
      }
    }).catch((err) => {
      console.error(err)
    })

  }, [])
  //#endregion

  return (
    <>
      <Dialog
        open={dialog}
        onClose={() => {setDialog(false)}}
      >
        <DialogTitle>
          {LocaleStrings.Form.DialogTitleError}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setDialog(false)}}>{LocaleStrings.Buttons.DialogClose}</Button>
        </DialogActions>
      </Dialog>
      <HeaderDisplay libTitle={libName} docTitle={item['Title'] ?? fileName} docState={item['acStavDokumentu']} />
      <Divider />
      <Stack direction='row' display={'flex'}>
        <Paper elevation={1} square sx={{flex: 1, minHeight: '50rem', margin: '0.2rem'}}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabVal} onChange={handleChange} variant='scrollable' allowScrollButtonsMobile>
              <Tab label='Hlavné' {...tabProps(0)} />
              <Tab label='Prílohy' {...tabProps(1)} />
              {(docLib === DocLib.Rozpracovane || docLib === DocLib.Archivne) && <Tab value={2} label='Pripomienkovanie' {...tabProps(2)} />}
              {(docLib === DocLib.Rozpracovane || docLib === DocLib.Archivne) && <Tab value={3} label='Schvaľovanie' {...tabProps(3)} />}
              {(docLib === DocLib.Platne || docLib === DocLib.Archivne) && <Tab value={4} label='Oboznamovanie' {...tabProps(4)} />}
            </Tabs>
          </Box>
          <TabPanel value={tabVal} index={0}>
            <form>
              <Stack direction='column' spacing={2} sx={{maxWidth: '30rem'}}>
                <Stack direction='column' spacing={3}>
                  <TextCard id='Title' fieldName='Title' item={item} setItem={setItem} colProps={colProps} displayMode={displayMode} />
                  <NumberCard id='acVerzia' fieldName='acVerzia' item={item} setItem={setItem} colProps={colProps} displayMode={displayMode} />
                  <SelectCard id='acStavDokumentu' fieldName='acStavDokumentu' item={item} setItem={setItem} colProps={colProps} displayMode={displayMode} />
                </Stack>
                <Stack direction='row' spacing={2}>
                  {displayMode === FormDisplayMode.Display
                      ? <Button variant='contained' size='small' color='warning'
                        href={`${props.context.pageContext.web.absoluteUrl}/_layouts/15/SPListForm.aspx?PageType=6&List=${props.context.list.guid}&ID=${props.context.itemId}&Source=${sourcePage}`}
                        >
                          {LocaleStrings.Buttons.Edit}
                        </Button>
                      : <Button variant='contained' size='small' color='success' onClick={handleSubmit}>{LocaleStrings.Buttons.Save}</Button>}
                  <Button variant='contained' size='small' color='error' onClick={() => {props.onClose()}}>{LocaleStrings.Buttons.Close}</Button>
                </Stack>
              </Stack>
            </form>
          </TabPanel>
          <TabPanel value={tabVal} index={1}>
            <ListAttachments sp={props.sp} dokId={item['acDokId']} itemState={'Nový'} setDialog={setDialog} setErrorMessage={setErrorMessage} archived={docLib === DocLib.Archivne} />
          </TabPanel>
          <TabPanel value={tabVal} index={2}>
            <Stack direction='column' spacing={2}>
              <PeopleCard sp={props.sp} context={props.context} id='acPripomienkovatelia' fieldName='acPripomienkovatelia'
                item={item} setItem={setItem} colProps={colProps} displayMode={displayMode} multiple />
              <DateCard id='acPripomDate' fieldName='acPripomDate' item={item} setItem={setItem} colProps={colProps}
                dateonly={true} displayMode={displayMode} />
              <ListUlohy sp={props.sp} dokumentId={item['Id']} currentUser={currentUser} ulohaTyp='Pripomienkovanie' archived={docLib === DocLib.Archivne} />
              <ListPripomienky sp={props.sp} dokumentId={item['Id']} currentUser={currentUser} archived={docLib === DocLib.Archivne} />
            </Stack>
          </TabPanel>
          <TabPanel value={tabVal} index={3}>
            <Stack direction='column' spacing={2}>
              <PeopleCard sp={props.sp} context={props.context} id='acSchvalovatelia' fieldName='acSchvalovatelia'
                item={item} setItem={setItem} colProps={colProps} displayMode={displayMode} multiple />
              <DateCard id='acSchvalDate' fieldName='acSchvalDate' item={item} setItem={setItem} colProps={colProps}
                dateonly={true} displayMode={displayMode} />
              <ListUlohy sp={props.sp} dokumentId={item['Id']} currentUser={currentUser} ulohaTyp='Schvalovanie' archived={docLib === DocLib.Archivne} />
            </Stack>
          </TabPanel>
          <TabPanel value={tabVal} index={4}>
            <Stack direction='column' spacing={2}>
              <PeopleCard sp={props.sp} context={props.context} id='acOboznamovatelia' fieldName='acOboznamovatelia'
                item={item} setItem={setItem} colProps={colProps} displayMode={displayMode} multiple />
              <DateCard id='acOboznaDate' fieldName='acOboznaDate' item={item} setItem={setItem} colProps={colProps}
                dateonly={true} displayMode={displayMode} />
              <ListUlohy sp={props.sp} dokumentId={item['Id']} currentUser={currentUser} ulohaTyp='Oboznamovanie' archived={docLib === DocLib.Archivne} />
            </Stack>
          </TabPanel>
        </Paper>
        <Paper elevation={1} square sx={{flex: 1, padding: '0.5rem', minWidth: '35rem', height: '50rem', margin: '0.2rem'}}>
          <iframe
            title="File preview"
            width="100%"
            height="100%"
            src={item['ServerRedirectedEmbedUrl']}
          />
          <Button variant='contained' size='small' color='warning' onClick={() => { window.open(item['ServerRedirectedEmbedUrl']) }}>{LocaleStrings.Buttons.OpenDoc}</Button>
        </Paper>
      </Stack>
    </>
  )
}

export default RdDocForm
