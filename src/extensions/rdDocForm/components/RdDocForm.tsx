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
import { TextCard } from './cards'
import { getLangStrings, ILang } from '../loc/langHelper'
import ListAttachments from './dataDisplays/listAttachments'

export interface IRdDocFormProps {
  context: FormCustomizerContext
  displayMode: FormDisplayMode
  onSave: (item: Record<string, any>) => Promise<void>
  onClose: () => void
  theme: ITheme
  sp: SPFI
}

export const LocaleStrings: ILang = getLangStrings('sk')

const LOG_SOURCE: string = 'RdDocForm'
const PrilohyListId: string = ''

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
  //#endregion

  //#region ON_LOAD
  React.useEffect(() => {
    const removeFields = ['@odata.context', '@odata.editLink', '@odata.metadata', '@odata.etag', '@odata.id', '@odata.type',
      'OData__ColorTag', 'OData__dlc_DocId', 'OData__dlc_DocIdUrl', 'OData__CopySource', 'OData__UIVersionString',
      'MediaServiceImageTags', 'MediaServiceOCR', 'acColButtons']

    // ensure prilohy folder
    if (props.displayMode !== FormDisplayMode.New ) {
      const tmpItem = item
      removeFields.forEach(removeField => {
        delete tmpItem[removeField]
      })
      setItem(tmpItem)

      EnsureFolder(PrilohyListId, `${item['Id']}`, props.sp)
      .catch((error) => {
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
          Vysktla sa chyba
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setDialog(false)}}>{'Zatvoriť'}</Button>
        </DialogActions>
      </Dialog>
      <HeaderDisplay libTitle={libName} docTitle={item['Title'] ?? fileName} docState={item['acColStavDokumentu']} />
      <Divider />
      <Stack direction='row'>
        <Paper elevation={1} square sx={{width: '100%', minHeight: '50rem', margin: '0.2rem'}}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabVal} onChange={handleChange} variant='scrollable' allowScrollButtonsMobile>
              <Tab label='Hlavné' {...tabProps(0)} />
              <Tab label='Prílohy' {...tabProps(1)} />
              <Tab label='Pripomienkovanie' {...tabProps(2)} />
              <Tab label='Schvaľovanie' {...tabProps(3)} />
            </Tabs>
          </Box>
            <TabPanel value={tabVal} index={0}>
              <form>
                <Stack direction='column' spacing={2} sx={{maxWidth: '30rem'}}>
                  <Stack direction='column' spacing={2}>
                    <TextCard id='Title' fieldName='Title' item={item} setItem={setItem} colProps={colProps} displayMode={props.displayMode}/>
                  </Stack>
                  <Stack direction='row' spacing={2}>
                    {props.displayMode === FormDisplayMode.Display
                        ? <Button variant='contained' size='small' color='warning' disabled={isEditDisabled}
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
              <ListAttachments sp={props.sp} itemId={item['Id']} itemState={item['acColStavDokumentu']} setErrorMessage={setErrorMessage} setShow={setShow} pocetPrilohHandle={PocetPrilohHandle} mainListId={props.context.list.guid.toString()} />
            </TabPanel>
            <TabPanel value={tabVal} index={2}>
              <Stack direction='column' spacing={2} sx={{maxWidth: '30rem'}}>
                <DateCard id='acColDatPripZaciatok' title={PripStartProps ? PripStartProps.Title : ''} displayMode={FormDisplayMode.Display}
                      required={PripStartProps ? PripStartProps.Required : false} itemHandle={PripStartHandle} dateonly={true}/>
                <PeoplePicker
                    context={props.context}
                    titleText={PripPeopleProps ? PripPeopleProps.Title : ''}
                    suggestionsLimit={100}
                    groupName={''}
                    showtooltip={true}
                    disabled={true}
                    required={true}
                    ensureUser={true}
                    defaultSelectedUsers={PripoDefault}
                    onChange={(people: IPersonaProps[]) => {}}
                    principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                    personSelectionLimit={100}
                    resolveDelay={1000}
                  />
                <DateCard id='acColPripDeadLine' title={PripDeadLineProps ? PripDeadLineProps.Title : ''} displayMode={FormDisplayMode.Display}
                      required={PripDeadLineProps ? PripDeadLineProps.Required : false} itemHandle={PripDeadLineHandle} dateonly={true}/>
                <DateCard id='acColDatSchvalGarantom' title={GADProps ? GADProps.Title : ''} displayMode={FormDisplayMode.Display}
                      required={GADProps ? GADProps.Required : false} itemHandle={GADHandle} dateonly={true}/>
              </Stack>
              <ListReminderTasks sp={props.sp} filterId={item['Id']} isAdminOrGarant={isAdmin || +item['GarantId'] === currentUser?.Id} currentUserId={currentUser?.Id} hasTasksUpdate={HasTasksUpdate} hasNewReminders={hasNewR} />
              <ListReminders sp={props.sp} filterId={item['Id']} newEnabled={item['acColStavDokumentu'] === 'V pripomienkovaní' && hasTask} setHasNew={setHasNewR} />
            </TabPanel>
            <TabPanel value={tabVal} index={3}>
              <Stack direction='column' spacing={2} sx={{maxWidth: '30rem'}}>
                <DateCard id='acColSchvalDeadLine' title={SchvalDoProps ? SchvalDoProps.Title : ''} displayMode={FormDisplayMode.Display}
                    required={SchvalDoProps ? SchvalDoProps.Required : false} itemHandle={SchvalDoHandle} dateonly={true}/>
                <Accordion disabled={item['acColSchvalovatelLevel01StringId'] ? false : true}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className='rounded' style={getSummaryStyle('01')}>
                      <Typography>Riaditeľ Úseku</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction='column' spacing={2}>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Schvaľovateľ`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel1Default]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <TextCard className='schval-card' id='acColSchvalOutcome01' title={'Výsledok'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalOutcome1Handle}/>
                      </Stack>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Realizoval`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel1SkutDefault]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <DateCard className='schval-card' id='acColDatSchvalLevel01' title={'Dňa'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalDat1Handle} dateonly={true}/>
                      </Stack>
                      <TextCard id='acColSchvalPoznam01' title={'Poznámka'} displayMode={FormDisplayMode.Display}
                          required={false} itemHandle={SchvalPozn1Handle}/>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Accordion disabled={item['acColSchvalovatelLevel02StringId'] ? false : true}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className='rounded' style={getSummaryStyle('02')}>
                      <Typography>ZpK</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction='column' spacing={2}>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Schvaľovateľ`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel2Default]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <TextCard className='schval-card' id='acColSchvalOutcome02' title={'Výsledok'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalOutcome2Handle}/>
                      </Stack>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Realizoval`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel2SkutDefault]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <DateCard className='schval-card' id='acColDatSchvalLevel02' title={'Dňa'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalDat2Handle} dateonly={true}/>
                      </Stack>
                      <TextCard id='acColSchvalPoznam02' title={'Poznámka'} displayMode={FormDisplayMode.Display}
                          required={false} itemHandle={SchvalPozn2Handle}/>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Accordion disabled={item['acColSchvalovatelLevel03StringId'] ? false : true}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className='rounded' style={getSummaryStyle('03')}>
                      <Typography>Schvaľovateľ</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction='column' spacing={2}>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Schvaľovateľ`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel3Default]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <TextCard className='schval-card' id='acColSchvalOutcome03' title={'Výsledok'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalOutcome3Handle}/>
                      </Stack>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Realizoval`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel3SkutDefault]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <DateCard className='schval-card' id='acColDatSchvalLevel03' title={'Dňa'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalDat3Handle} dateonly={true}/>
                      </Stack>
                      <TextCard id='acColSchvalPoznam03' title={'Poznámka'} displayMode={FormDisplayMode.Display}
                          required={false} itemHandle={SchvalPozn3Handle}/>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Accordion disabled={item['acColSchvalovatelLevel04StringId'] ? false : true}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className='rounded' style={getSummaryStyle('04')}>
                      <Typography>Generálny riaditeľ</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction='column' spacing={2}>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Schvaľovateľ`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel4Default]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <TextCard className='schval-card' id='acColSchvalOutcome04' title={'Výsledok'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalOutcome4Handle}/>
                      </Stack>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Realizoval`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={[SchvalLevel4SkutDefault]}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={1}
                          resolveDelay={1000}
                        />
                        <DateCard className='schval-card' id='acColDatSchvalLevel04' title={'Dňa'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalDat4Handle} dateonly={true}/>
                      </Stack>
                      <TextCard id='acColSchvalPoznam04' title={'Poznámka'} displayMode={FormDisplayMode.Display}
                          required={false} itemHandle={SchvalPozn4Handle}/>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Accordion disabled={item['acColSchvalovatelLevel05StringId'] ? false : true}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className='rounded' style={getSummaryStyle('05')}>
                      <Typography>Predseda predstavenstva</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction='column' spacing={2}>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Schvaľovatelia`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={SchvalLevel5Default}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={2}
                          resolveDelay={1000}
                        />
                        <TextCard className='schval-card' id='acColSchvalOutcome05' title={'Výsledok'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalOutcome5Handle}/>
                      </Stack>
                      <Stack direction='row' spacing={2}>
                        <PeoplePicker
                          context={props.context}
                          titleText={`Realizovali`}
                          suggestionsLimit={100}
                          groupName={''}
                          showtooltip={true}
                          disabled={true}
                          required={true}
                          ensureUser={true}
                          defaultSelectedUsers={SchvalLevel5SkutDefault}
                          onChange={(people: IPersonaProps[]) => {}}
                          principalTypes={[PrincipalType.User]}
                          personSelectionLimit={2}
                          resolveDelay={1000}
                        />
                        <DateCard className='schval-card' id='acColDatSchvalLevel05' title={'Dňa'} displayMode={FormDisplayMode.Display}
                            required={false} itemHandle={SchvalDat5Handle} dateonly={true}/>
                      </Stack>
                      <TextCard id='acColSchvalPoznam05' title={'Poznámka'} displayMode={FormDisplayMode.Display}
                          required={false} itemHandle={SchvalPozn5Handle}/>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </TabPanel>
          </Paper>
      </Stack>
      <div className='content'>
        <div className='metadata'>
          
        </div>
        <div className='preview'>
          <Paper elevation={1} square sx={{padding: '0.5rem', width: '35rem', height: '50rem', margin: '0.2rem'}}>
            <iframe
              title="File preview"
              width="100%"
              height="100%"
              src={item['ServerRedirectedEmbedUrl']}
            />
            <Button variant='contained' size='small' color='warning' onClick={() => { window.open(item['ServerRedirectedEmbedUrl']) }}>{LocaleStrings.Buttons.OpenDoc}</Button>
          </Paper>
        </div>
      </div>
    </>
  )
}

export default RdDocForm
