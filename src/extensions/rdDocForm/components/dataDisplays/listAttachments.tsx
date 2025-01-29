import * as React from 'react'
import { FC } from 'react'

import { ListView, IViewField } from "@pnp/spfx-controls-react/lib/ListView"
import { IColumn } from 'office-ui-fabric-react'
import { CloseIcon } from '@fluentui/react-icons-northstar'
import { Button } from '@mui/material'
import { SPFI } from '@pnp/sp'
import { PrilohyListId } from '../formTemplates'
import { Contains } from '../../help/helperFunctions'

import "@pnp/sp/items/get-all"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IListAttachmentsProps {
  sp: SPFI
  itemId: number
  itemState: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  pocetPrilohHandle: IHandle<number>
  mainListId: string
}

const ListAttachments: FC<IListAttachmentsProps> = (props) => {
  const [Prilohy, SetPrilohy] = React.useState<any[]>([])

  const updateProlohyCount = (count: number): void => {
    props.pocetPrilohHandle.setValue(count)
    props.sp.web.lists.getById(props.mainListId)
    .items.getById(props.itemId)
    .update({['acColPocetPriloh']: count})
    .then(() => {return})
    .catch((error) => {
      console.error(error)
    })
  }

  const updatePrilohy = (updateCount: boolean = true): void => {
    props.sp.web.lists.getById(PrilohyListId)()
    .then((list) => {
      props.sp.web.getFolderByServerRelativePath(`${list.EntityTypeName}/${props.itemId}`).files.select('*').orderBy('Name')()
      .then((files) => {
        const oldCount = Prilohy.length
        if (updateCount && oldCount !== files.length){
          updateProlohyCount(files.length)
        }
        SetPrilohy(files)
      }).catch((error) => {
        console.error(error)
      })
    }).catch((error) => {
      console.error(error)
    })
  }

  const onDrop = async (files: File[]): Promise<void> => {
    for (const file of files) {
      await props.sp.web.lists.getById(PrilohyListId)
      .rootFolder.folders.getByUrl(`${props.itemId}`).files.getByUrl(file.name)().then((file) => {
        // found pre existing file
        props.setErrorMessage(`Súbor ${file.Name} už existuje ako príloha pre tento dokument. Pre to ho nie je možné pridať.`)
        props.setShow(true)
      }, async (reason) => {
        // no existing file with same name
        console.log(reason)
        await props.sp.web.lists.getById(PrilohyListId)
          .rootFolder.folders.getByUrl(`${props.itemId}`).files.addChunked(file.name, file, undefined, true)
          .then(async (fileItem) => {
            await fileItem.file.getItem().then(async (fileListItem) => {
              await fileListItem.update({
                ['acColDokumentID']: props.itemId
              }).then(() => {
                updatePrilohy(false)
              }).catch((error) => {
                console.error(error)
              })
            }).catch((error) => {
              console.error(error)
            })
          }).catch((error) => {
            console.error(error)
          })
      }).catch((error) => {
        console.error(error)
      })
    }
    updatePrilohy()
  }

  const onRemove = (item: any): void => {
    props.sp.web.getFileById(item['UniqueId']).recycle()
    .then(() => {
      updatePrilohy()
    }).catch((error) => {
      console.error(error)
    })
  }

  const viewFields: IViewField[] = [
    {
      name: 'Name',
      displayName: 'File Name',
      sorting: true,
      maxWidth: 400,
      render: (item?: any, index?: number, column?: IColumn) => {
        return (
          <>
            <a href={`https://tatravagonkask.sharepoint.com${item['ServerRelativeUrl']}`}>{item['Name']}</a>
          </>
        )
      }
    },
    {
      name: '',
      maxWidth: 50,
      render: (item?: any, index?: number, column?: IColumn) => {
        return (
          <>
            {
              !Contains(['Spúšťa sa pripomienkovanie...',  'Spúšťa sa schvaľovanie...', 'V schvaľovaní', 'Schválený'], props.itemState) &&
              <a className='list-button' onClick={() => {onRemove(item)}}><div className='icon'><CloseIcon /></div></a>
            }
          </>
        )
      }
    }
  ]

  React.useEffect(() => {
    updatePrilohy()
  }, [props.itemId])

  return (
    <>
      <Button
        variant='contained'
        size='small'
        color='warning'
        disabled={Contains(['Spúšťa sa schvaľovanie...', 'V schvaľovaní', 'Schválený'], props.itemState)}>
          <label htmlFor='FileInput' className='pointer'>Pridať súbory</label>
          <input type='file' id='FileInput' multiple hidden onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(event.target.files))
            .catch((error) => {
              console.error(error)
            })
          }} />
      </Button>
      <ListView
        items={Prilohy}
        viewFields={viewFields}
        iconFieldName='LinkingUrl'
        compact={true}
        dragDropFiles={true}
        onDrop={onDrop}
        stickyHeader={true}
        className='attachments-wrapper'
      />
    </>
  )
}

export default ListAttachments
