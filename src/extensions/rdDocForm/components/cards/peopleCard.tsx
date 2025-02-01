import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { LocaleStrings } from '../RdDocForm'
import { SPFI } from '@pnp/sp'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility'
import { getSiteUsersAndGroups, getUserOrGroupById } from '../../help/functions'


interface IPeopleCard {
  sp: SPFI
  context: FormCustomizerContext
  id: string
  fieldName: string
  item: Record<string, any>
  setItem: (value: any) => void
  colProps: Record<string, IColProps>
  displayMode: FormDisplayMode
  multiple?: boolean
  allowGroups?: boolean
  required?: boolean
  className?: string
}

const PeopleCard: React.FC<IPeopleCard> = (props) => {
  const [error, setError] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const [options, setOptions] = React.useState<IMember[]>([])

  const [selectedS, setSelectedS] = React.useState<IMember | null>(null)
  const [selectedM, setSelectedM] = React.useState<IMember[]>([])
  
  const [filterInput, setFilterInput] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)

  const getTitle = (): string => {
    let title = props.fieldName
    
    if (props.colProps[props.fieldName]) {
      title = props.colProps[props.fieldName].Title ?? title
    }

    return title
  }

  const setInitVals = async (): Promise<void> => {
    if (props.item && props.item[`${props.fieldName}Id`]) {
      if (props.multiple) {
        const values: number[] = props.item[`${props.fieldName}Id`]
        const initSelectedM: IMember[] = []
        for (const value of values) {
          const member = await getUserOrGroupById(props.sp, value)
          if (member) {
            initSelectedM.push(member)
          }
        }
        setSelectedM(initSelectedM)


        for (const option of options) {
          if (option.id === props.item[`${props.fieldName}Id`]) {
            setSelectedS(option)
            break
          }
        }
      }
      else {
        const member = await getUserOrGroupById(props.sp, props.item[`${props.fieldName}Id`])
        if (member) {
          setSelectedS(member)
        }
      }
    }
  }

  const onInputChange = (event: React.SyntheticEvent<Element, Event>, newValue: string): void => {
    setFilterInput(newValue)
    setLoading(true)
    getSiteUsersAndGroups(props.sp, props.context, props.multiple ?? false, newValue)
    .then((members) => {
      setOptions(members)
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      setLoading(false)
    })
  }

  // Set initial value from SharePoint list item
  React.useEffect(() => {
    setInitVals().then().catch((err) => {
      console.error(err)
    })
  }, [props.fieldName, props.multiple])

  const onChangeS = (event: React.SyntheticEvent<Element, Event>, newValue: IMember): void => {
    if (!event && !newValue) {return}
    setSelectedS(newValue)
    
    props.setItem({
      ...props.item,
      [`${props.fieldName}Id`]: newValue,
      [`${props.fieldName}StringId`]: `${newValue}`,
    })

    const required = props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)
    const missingVal = newValue ? false : required

    if (missingVal) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${getTitle()}`)
      setError(true)
      return
    }
  }

  const onChangeM = (event: React.SyntheticEvent<Element, Event>, newValue: IMember[]): void => {
    if (!event && !newValue) {return}
    setSelectedM(newValue)
    
    props.setItem({
      ...props.item,
      [`${props.fieldName}Id`]: newValue.map((member) => member.id),
      [`${props.fieldName}StringId`]: newValue.map((member) => `${member.id}`),
    })

    const required = props.required || (props.colProps[props.fieldName] ? props.colProps[props.fieldName].Required : false)
    const missingVal = newValue ? false : required

    if (missingVal) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${getTitle()}`)
      setError(true)
      return
    }
  }

  try {
    return (
      props.multiple
      ? <Autocomplete
        disablePortal
        multiple
        id={props.id}
        disabled={props.displayMode === FormDisplayMode.Display}
        options={options}
        getOptionLabel={(option) => option.name}
        fullWidth
        loading={loading}
        loadingText={LocaleStrings.Cards.LoadingMembers}
        value={selectedM}
        onChange={onChangeM}
        inputValue={filterInput}
        onInputChange={onInputChange}
        onOpen={() => {onInputChange(null as any, '')}}
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
      : <Autocomplete
        disablePortal
        id={props.id}
        disabled={props.displayMode === FormDisplayMode.Display}
        options={options}
        getOptionLabel={(option) => option.name}
        fullWidth
        loading={loading}
        loadingText={LocaleStrings.Cards.LoadingMembers}
        value={selectedS}
        onChange={onChangeS}
        inputValue={filterInput}
        onInputChange={onInputChange}
        onOpen={() => {onInputChange(null as any, '')}}
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

export default PeopleCard;
