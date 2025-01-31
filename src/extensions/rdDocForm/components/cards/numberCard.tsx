import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { TextField } from '@mui/material'
import { LocaleStrings } from '../RdDocForm'

interface INumberCard {
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

const NumberCard: React.FC<INumberCard> = (props) => {
  const [error, setError] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const getTitle = (): string => {
    let title = props.fieldName
    
    if (props.colProps[props.fieldName]) {
      title = props.colProps[props.fieldName].Title ?? title
    }

    return title
  }

  const checkInput = (value: number | null): void => {
    const colProps = props.colProps[props.fieldName]
    const required = props.required || (colProps ? colProps.Required : false)
    const missingVal = required && (value === null || value === undefined)

    if (missingVal) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${getTitle()}`)
      setError(true)
      return
    }

    if (colProps) {
      const minVal = colProps.MinimumValue
      const maxVal = colProps.MaximumValue
      const itemVal = props.item[props.fieldName]

      if (minVal !== undefined && itemVal < minVal) {
        setErrorMessage(`${getTitle() ? getTitle() : LocaleStrings.Cards.ThisValue}  ${LocaleStrings.Cards.CanNotLower} ${minVal}`)
        setError(true)
        return
      }
      if (maxVal !== undefined && itemVal > maxVal) {
        setErrorMessage(`${getTitle() ? getTitle() : LocaleStrings.Cards.ThisValue} ${LocaleStrings.Cards.CanNotHigher} ${maxVal}`)
        setError(true)
        return
      }
    }

    let verifyResult = ''
    if (props.valueVerify) {
      verifyResult = props.valueVerify(props.item[props.fieldName])
    }

    if (verifyResult) {
      setErrorMessage(verifyResult)
      setError(true)
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue: number | null = event.target.value ? +event.target.value : null

    props.setItem({
      ...props.item,
      [props.fieldName]: newValue,
    })

    checkInput(newValue)
  }

  React.useEffect(() => {
    checkInput(props.item[props.fieldName] ?? '')
  }, [props.required, props.colProps])

  try {
    return (
      <TextField
        id={props.id}
        disabled={props.displayMode === FormDisplayMode.Display}
        fullWidth
        label={getTitle()}
        type='number'
        variant='standard'
        required={props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)}
        value={props.item[props.fieldName]}
        onChange={onChange}
        error={error}
        helperText={errorMessage}
        InputLabelProps={{ shrink: props.item[props.fieldName] !== null && props.item[props.fieldName] !== undefined }}
      />
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>{LocaleStrings.Cards.RenderError}</div>
    )
  }
};

export default NumberCard;
