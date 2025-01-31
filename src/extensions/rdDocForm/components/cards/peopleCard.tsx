import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { LocaleStrings } from '../RdDocForm'
import { SPFI } from '@pnp/sp'

interface IPeopleCard {
  sp: SPFI
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

interface Person {
    id: number;
    name: string;
    type: "User" | "Group"
  }

const PeopleCard: React.FC<IPeopleCard> = (props) => {
  const [error, setError] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const [options, setOptions] = React.useState<Person[]>([])
  const [selected, setSelected] = React.useState<Person | Person[] | null>(props.multiple ? [] : null)
  const [loading, setLoading] = React.useState<boolean>(false)

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

  async function fetchPeople(searchQuery: string = "") {
    setLoading(true);
    try {
      let peopleData: Person[] = [];
  
      // Fetch users with OData filter
      const users = await props.sp.web.siteUsers
        .filter(searchQuery ? `substringof('${searchQuery}', Title)` : "")()
  
      peopleData = users.map((user) => ({
        id: user.Id,
        name: user.Title,
        type: "User",
      }));
  
      // Fetch SharePoint groups if allowed
      if (props.allowGroups) {
        const groups = await props.sp.web.siteGroups
          .filter(searchQuery ? `substringof('${searchQuery}', Title)` : "")()
  
        const groupData: Person[] = groups.map((group) => ({
          id: group.Id,
          name: group.Title,
          type: "Group",
        }));
  
        peopleData = [...peopleData, ...groupData];
      }
  
      setOptions(peopleData);
    } catch (error) {
      console.error("Error fetching users/groups:", error);
    }
    setLoading(false);
  }
  

  // Fetch users and groups from SharePoint
  React.useEffect(() => {
    fetchPeople()
  }, [props.allowGroups])

  // Set initial value from SharePoint list item
  React.useEffect(() => {
    if (props.item && props.item[props.fieldName]) {
      const initialValue = Array.isArray(props.item[props.fieldName]) ? props.item[props.fieldName] : [props.item[props.fieldName]];
      const initialSelection = initialValue.map((person: any) => ({
        id: person.Id,
        name: person.Title,
        type: person.PrincipalType === 1 ? "User" : "Group",
      }));

      setSelected(props.multiple ? initialSelection : initialSelection[0] || null);
    }
  }, [props.item, props.fieldName, props.multiple])

  const onChange = (event: React.SyntheticEvent<Element, Event>, newValue: Person | Person[] | null): void => {
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
          multiple={props.multiple}
          id={props.id}
          disabled={props.displayMode === FormDisplayMode.Display}
          options={options}
          fullWidth
          value={selected}
          onChange={onChange}
          {/*
          isOptionEqualToValue={(option, value) => {
          return option?.id === value?.id
          }}
            */...[]}
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
