import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { SPFI, spfi, SPFx } from "@pnp/sp"
import { LogLevel, PnPLogging } from "@pnp/logging"

import { Log } from '@microsoft/sp-core-library'
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility'

import RdDocForm, { IRdDocFormProps } from './components/RdDocForm'
import { ThemeProvider, ITheme } from '@microsoft/sp-component-base'

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

export default class RdDocFormCustomizer
  extends BaseFormCustomizer<IRdDocFormCustomizerProperties> {
    
  private _sp: SPFI
  private _themeProvider: ThemeProvider
  private _theme: ITheme | undefined

  public onInit(): Promise<void> {
    // Add your custom initialization to this method. The framework will wait
    // for the returned promise to resolve before rendering the form.
    Log.info(LOG_SOURCE, 'Activated RdDocFormFormCustomizer with properties:')
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2))

    this._sp = spfi().using(SPFx(this.context)).using(PnPLogging(LogLevel.Warning))
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey)
    this._theme = this._themeProvider.tryGetTheme()

    return Promise.resolve()
  }

  public render(): void {
    // Use this method to perform your custom rendering.

    const rdDocForm: React.ReactElement<IRdDocFormProps> =
      React.createElement(RdDocForm, {
        context: this.context,
        displayMode: this.displayMode,
        onSave: this._onSave,
        onClose: this._onClose,
        theme: this._theme,
        sp: this._sp,
       } as IRdDocFormProps)

    ReactDOM.render(rdDocForm, this.domElement)
  }

  public onDispose(): void {
    // This method should be used to free any resources that were allocated during rendering.
    ReactDOM.unmountComponentAtNode(this.domElement)
    super.onDispose()
  }

  private _onSave = (): void => {

    // You MUST call this.formSaved() after you save the form.
    this.formSaved()
  }

  private _onClose =  (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed()
  }
}
