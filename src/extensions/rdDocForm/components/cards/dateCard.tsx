import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers'
import { LocaleStrings } from '../RdDocForm'

interface IDateCard {
  id: string
  fieldName: string
  item: Record<string, any>
  setItem: (value: any) => void
  colProps: Record<string, IColProps>
  displayMode: FormDisplayMode
  dateonly: boolean
  required?: boolean
  className?: string
  valueVerify?: (value: string) => string
}

const DateCard: React.FC<IDateCard> = (props) => {
  const [value, setValue] = React.useState<Dayjs | null>(props.item[props.fieldName] ? dayjs(props.item[props.fieldName].replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[0-9a-zA-Z:.-]*/, '$1')) : null)
  const [error, setError] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  const getTitle = (): string => {
    let title = props.fieldName
    
    if (props.colProps[props.fieldName]) {
      title = props.colProps[props.fieldName].Title ?? title
    }

    return title
  }
  
  const checkInput = (dateVal: string): void => {
    const colProps = props.colProps[props.fieldName]
    const required = props.required || (colProps ? colProps.Required : false)
    const missingVal = required && (dateVal === null || dateVal === undefined)

    if (missingVal) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${getTitle()}`)
      setError(true)
      return
    }

    let verifyResult = ''
    if (props.valueVerify) {
      verifyResult = props.valueVerify(dateVal)
    }

    if (verifyResult) {
      setErrorMessage(verifyResult)
      setError(true)
    }
  }

  const onChange = (newValue: Dayjs): void => {
    const newDate = newValue && newValue.isValid() ? newValue.toISOString() : ''

    props.setItem({
      ...props.item,
      [props.fieldName]: newDate,
    })

    checkInput(newDate)
    setValue(newValue)
  }

  React.useEffect(() => {
    const newDate = value && value.isValid() ? value.toISOString() : ''
    checkInput(newDate)
  }, [props.required, props.colProps])

  try {
    return props.dateonly ? (
      <div className={props.className}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disabled={props.displayMode === FormDisplayMode.Display}
            label={getTitle()}
            value={value}
            onChange={onChange}
            format='DD.MM.YYYY'
            slotProps={{
              textField: {
                id: props.id,
                fullWidth: true,
                variant: 'standard',
                required: props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false),
                error: error,
                helperText: errorMessage,
              },
            }}
          />
        </LocalizationProvider>
      </div>
    )
    : (
      <div className={props.className}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            disabled={props.displayMode === FormDisplayMode.Display}
            label={getTitle()}
            value={value}
            onChange={onChange}
            format='DD.MM.YYYY hh:mm'
            slotProps={{
              textField: {
                id: props.id,
                fullWidth: true,
                variant: 'standard',
                required: props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false),
                error: error,
                helperText: errorMessage,
              },
            }}
          />
        </LocalizationProvider>
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

export default DateCard;
