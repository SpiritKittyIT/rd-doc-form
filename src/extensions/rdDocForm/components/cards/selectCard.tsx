import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { LocaleStrings } from '../RdDocForm'

interface ISelectCard {
  id: string
  fieldName: string
  item: Record<string, any>
  setItem: (value: any) => void
  colProps: Record<string, IColProps>
  displayMode: FormDisplayMode
  required?: boolean
  className?: string
}

const SelectCard: React.FC<ISelectCard> = (props) => {
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
    const required = props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)
    const missingVal = value ? false : required

    if (missingVal) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${getTitle()}`)
      setError(true)
      return
    }
  }

  const onChange = (event: React.SyntheticEvent<Element, Event>, newValue: string): void => {
    if (!event && !newValue) {return}
    
    props.setItem({
      ...props.item,
      [props.fieldName]: newValue,
    })

    checkInput(newValue)
  }

  React.useEffect(() => {
    checkInput(props.item[props.fieldName])
  }, [props.required, props.colProps])

  try {
    return (
      <Autocomplete
          disablePortal
          id={props.id}
          disabled={props.displayMode === FormDisplayMode.Display}
          options={props.colProps[props.fieldName].Choices ?? []}
          fullWidth
          value={props.item[props.fieldName]}
          onChange={onChange}
          isOptionEqualToValue={(option, value) => {
            return option?.value === value?.value
          }}
          renderInput={(params) => 
            <TextField
              {...params}
              label={getTitle()}
              variant='standard'
              required={props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)}
              error={error}
              helperText={errorMessage}
            />
          }
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

export default SelectCard;
