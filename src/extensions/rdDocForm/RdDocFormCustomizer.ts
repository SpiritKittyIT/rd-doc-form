import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { SPFI, spfi, SPFx } from "@pnp/sp"
import { LogLevel, PnPLogging } from "@pnp/logging"

import { FormDisplayMode, Log } from '@microsoft/sp-core-library'
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility'

import { IRdDocFormProps, LocaleStrings } from './components/RdDocForm'
import { ThemeProvider, ITheme } from '@microsoft/sp-component-base'
import { IItemUpdateResult } from '@pnp/sp/items'
import { ValidateUpdateMemberMultiField } from './help/functions'
import ThemeProviderWrapper from './components/ThemeProviderWrapper'

/**
 * If your form customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IRdDocFormCustomizerProperties {
  // This is an example replace with your own property
  sampleText?: string
}

const LOG_SOURCE: string = 'RdDocFormCustomizer'

export const formSubmit = async (
  sp: SPFI,
  item: Record<string, any>,
  listGuid: string,
  displayMode: FormDisplayMode,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setDialog: React.Dispatch<React.SetStateAction<boolean>>,
  onSave: (item: {}, etag?: string) => Promise<void>
): Promise<void> => {
  // non editing view
  if (displayMode === FormDisplayMode.Display){
    setErrorMessage(LocaleStrings.Form.DisplaySubmitError)
    setDialog(true)
    return
  }
  // error in input cards
  if (document.getElementsByClassName('Mui-error').length > 0){
    setErrorMessage(LocaleStrings.Form.FormSubmitError)
    setDialog(true)
    return
  }
  // required fields special check
  const reqFields: string[] = []
  for (const reqField of reqFields) {
    if (!item[reqField]) {
      setErrorMessage(`${LocaleStrings.Form.RequiredFieldsError}: ${reqField}`)
      setDialog(true)
      return
    }
  }
  // get new etag for submitting
  let etag: string = ''
  await sp.web.lists.getById(listGuid).items.getById(item.Id)().then((val) => {
    etag = val['odata.etag']
  }).catch((error) => {
    console.error(error)
  })

  const submitItem = item
  // fix datefield formats
  const dateFields: string[] = [
    // TODO
  ]
  dateFields.forEach((fieldName) => {
    if (item[fieldName]) {
      const newTime1 = new Date(item[fieldName].replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[0-9a-zA-Z:.-]*/, '$1'))
      submitItem[fieldName] = newTime1.toISOString()
    }
  })
  // fix people field formats
  const peopleFields: string[] = [
    // TODO
  ]
  peopleFields.forEach((fieldName) => {
    if (!item[`${fieldName}Id`]) {
      item[`${fieldName}Id`] = []
    }
    if (!item[`${fieldName}StringId`]) {
      item[`${fieldName}StringId`] = []
    }
  })
  // fix lookup field formats
  const listFields: string[] = [
    // TODO
  ]
  listFields.forEach((fieldName) => {
    if (!item[`${fieldName}Id`]) {
      item[`${fieldName}Id`] = []
    }
  })

  await onSave(submitItem, etag).catch((error: Error) => {
    if (error.message.indexOf('The request ETag value') !== -1){
      setErrorMessage(LocaleStrings.Form.ETagValueError)
    }
    else {
      setErrorMessage(error.message)
    }
    setDialog(true)
  })
}

export default class RdDocFormCustomizer
  extends BaseFormCustomizer<IRdDocFormCustomizerProperties> {
    
  private _sp: SPFI
  private _themeProvider: ThemeProvider
  private _theme: ITheme | undefined

  public onInit(): Promise<void> {
    // Add your custom initialization to this method. The framework will wait
    // for the returned promise to resolve before rendering the form.
    Log.info(LOG_SOURCE, 'Activated RdDocFormCustomizer with properties:')
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2))

    this._sp = spfi().using(SPFx(this.context)).using(PnPLogging(LogLevel.Warning))
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey)
    this._theme = this._themeProvider.tryGetTheme()

    return Promise.resolve()
  }

  public render(): void {
    // Use this method to perform your custom rendering.

    const themeProviderWrapper: React.ReactElement<IRdDocFormProps> =
      React.createElement(ThemeProviderWrapper, {
        context: this.context,
        displayMode: this.displayMode,
        onSave: this._onSave,
        onClose: this._onClose,
        formSubmit: formSubmit,
        theme: this._theme,
        sp: this._sp,
       } as IRdDocFormProps)

    ReactDOM.render(themeProviderWrapper, this.domElement)
  }

  public onDispose(): void {
    // This method should be used to free any resources that were allocated during rendering.
    ReactDOM.unmountComponentAtNode(this.domElement)
    super.onDispose()
  }

  private _onSave = async (item: Record<string, any>, etag: string): Promise<void> => {
    // disable all input elements while we're saving the item
    this.domElement.querySelectorAll('input').forEach(el => el.setAttribute('disabled', 'disabled'))
    
    // person or group multi select fields need to be validated
    const fieldsToValidate: {fieldName: string, fieldValue: number[]}[] = [
      {fieldName: 'acPripomienkovatelia', fieldValue: item['acPripomienkovateliaId']},
      {fieldName: 'acSchvalovatelia', fieldValue: item['acSchvalovateliaId']},
      {fieldName: 'acOboznamovatelia', fieldValue: item['acOboznamovateliaId']},
    ]
    const deleteFields: string[] = ['SharedWithUsersId']
    
    const validatedItem = {...item}
    let newEtag: string = etag
    switch (this.displayMode) {
      case FormDisplayMode.New:
        await this._sp.web.lists.getById(this.context.list.guid.toString()).items.add(item)
          .then((result: IItemUpdateResult) => {return},
          (reason: any) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw new Error('Form submit error.')
        }).catch((err) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw err
        })
        break
      case FormDisplayMode.Edit:
        if (fieldsToValidate.length > 0) {
          await ValidateUpdateMemberMultiField(fieldsToValidate, this._sp)
          .then(async (validateFields) => {
            await this._sp.web.lists.getById(this.context.list.guid.toString()).items.getById(item.Id)
            .validateUpdateListItem(validateFields)
            .then((val) => {return})
            .catch((err) => {
              if(err.message.indexOf('is locked for shared use') !== -1){
                throw new Error('Dokument má otvorený iný používateľ a teda sa momentálne nedá upraviť. Prosím vyskúšajte neskôr.')
              }
              throw err
            })
          }).catch((err: Error) => {
            throw err
          })

          while (newEtag === etag) {
            await this._sp.web.lists.getById(this.context.list.guid.toString()).items.getById(item.Id)().then((val) => {
              newEtag = val['odata.etag']
            }).catch((error) => {
              console.error(error)
            })
            await new Promise((resolve, reject) => setTimeout(resolve, 100)).then((val) => {return}).catch((val) => {return})
          }
        }

        fieldsToValidate.forEach((field) => {
          delete validatedItem[`${field.fieldName}Id`]
          delete validatedItem[`${field.fieldName}StringId`]
        })

        deleteFields.forEach((fieldName) => {
          delete validatedItem[fieldName]
        })
        
        await this._sp.web.lists.getById(this.context.list.guid.toString()).items.getById(item.Id).update(validatedItem, newEtag)
        .then((result: IItemUpdateResult) => {return},
          (reason: any) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          console.log(reason)
          throw new Error('Form submit error.')
        }).catch((err) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw err
        })
        break
    }
    // You MUST call this.formSaved() after you save the form.
    this.formSaved()
  }

  private _onClose =  (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed()
  }
}
