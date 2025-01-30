export interface ILang{
  Buttons: {
    Save: string
    Edit: string
    Close: string
    StartProcess: string
    DialogClose: string
    OpenDoc: string
  }
  Cards: {
    RenderError: string
    ThisField: string
    PleaseFill: string
    Select: string
    Placeholder: string
    ThisValue: string
    CanNotLower: string
    CanNotHigher: string
  }
  DataDisplays: {
    DragNDropUpload: string
  }
  Form: {
    DialogTitleError: string
    DisplaySubmitError: string
    FormSubmitError: string
    ETagValueError: string
    RequiredFieldsError: string
  }
  Helper: {
    UserNotFound: string
  }
}

export const getLangStrings = (locale: string): ILang => {
  switch (locale) {
    case 'sk':
      return require(/* webpackChunkName: 'lang' */'./sk.json')
    default:
      return require(/* webpackChunkName: 'lang' */'./en.json')
  }
}
