import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { TextField } from '@mui/material'
import { LocaleStrings } from '../RdDocForm'

interface ITextCard {
  id: string
  fieldName: string
  item: Record<string, any>
  setItem: (value: any) => void
  colProps: Record<string, IColProps>
  displayMode: FormDisplayMode
  required?: boolean
  className?: string
  valueVerify?: (value: string) => string
}

const TextCard: React.FC<ITextCard> = (props) => {
  const [error, setError] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const getTitle = (): string => {
    let title = props.fieldName
    
    if (props.colProps[props.fieldName]) {
      title = props.colProps[props.fieldName].Title ?? title
    }

    return title
  }

  const checkInput = (value: string): void => {
    let verifyResult = ''
    if (props.valueVerify) {
      verifyResult = props.valueVerify(props.item[props.fieldName])
    }
    const required = props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)
    const missingVal = value ? false : required
    const isErrorVal = verifyResult ? true : false
    
    setError(missingVal || isErrorVal)
    setErrorMessage((missingVal || isErrorVal)
      ? (
        missingVal
        ? `${LocaleStrings.Cards.PleaseFill} ${getTitle()}`
        : verifyResult
      )
      : ''
    )
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    props.setItem({
      ...props.item,
      [props.fieldName]: event.target.value,
    })

    checkInput(event.target.value)
  }

  React.useEffect(() => {
    checkInput(props.item[props.fieldName] ?? '')
  }, [props.required, props.colProps])

  try {
    return (
      <div className={props.className}>
        <TextField
          id={props.id}
          disabled={props.displayMode === FormDisplayMode.Display}
          fullWidth
          label={getTitle()}
          variant='standard'
          required={props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)}
          value={props.item[props.fieldName]}
          onChange={onChange}
          error={error}
          helperText={errorMessage}
          InputLabelProps={{ shrink: props.item[props.fieldName] ? true : false }}
        />
      </div>
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>{LocaleStrings.Cards.RenderError}</div>
    )
  }
};

export default TextCard;
