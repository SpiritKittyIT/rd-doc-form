import * as React from 'react'
import { FC } from 'react'

import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material'
import { SPFI } from '@pnp/sp'

import "@pnp/sp/items/get-all"
import { LocaleStrings, PrilohyListId } from '../RdDocForm'
import { useDropzone } from 'react-dropzone'
import { IFileInfo } from '@pnp/sp/files'

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"; // Default icon
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // PDF icon
import ImageIcon from "@mui/icons-material/Image"; // Image icon
import DescriptionIcon from "@mui/icons-material/Description"; // Document icon
import DeleteIcon from "@mui/icons-material/Close"; // Close (delete) icon

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IListAttachmentsProps {
  sp: SPFI
  itemId: number
  itemState: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  setDialog: React.Dispatch<React.SetStateAction<boolean>>
}

const ListAttachments: FC<IListAttachmentsProps> = (props) => {
  const [attachments, setAttachments] = React.useState<IFileInfo[]>([])

  const getAttachments = (): void => {
    props.sp.web.lists.getById(PrilohyListId).rootFolder.folders.getByUrl(`${props.itemId}`).files()
    .then((files) => {
      setAttachments(files)
    }).catch((error) => {
      console.error(error)
    })
  }

  React.useEffect(() => {
    getAttachments()
  }, [])

  // Handle file drop
  const onDrop = React.useCallback(async (files) => {
    for (const file of files) {
      await props.sp.web.lists.getById(PrilohyListId)
      .rootFolder.folders.getByUrl(`${props.itemId}`).files.getByUrl(file.name)().then((file) => {
        // found pre existing file
        props.setErrorMessage(`Súbor ${file.Name} už existuje ako príloha pre tento dokument. Pre to ho nie je možné pridať.`)
        props.setDialog(true)
      }, async (reason) => {
        // no existing file with same name
        console.log(reason)
        await props.sp.web.lists.getById(PrilohyListId)
          .rootFolder.folders.getByUrl(`${props.itemId}`).files.addChunked(file.name, file, undefined, true)
          .then(async (fileItem) => {
          }).catch((error) => {
            console.error(error)
          })
      }).catch((error) => {
        console.error(error)
      })
    }
    
    getAttachments()
  }, [])

  const removeAttachment = (attachment: IFileInfo): void => {
    props.sp.web.getFileById(attachment.UniqueId).recycle()
    .then(() => {
    }).catch((error) => {
      console.error(error)
    })
    setAttachments((prevFiles) => prevFiles.filter((file) => file.UniqueId !== attachment.UniqueId));
  };

  // Function to get icon based on file type
  const getFileIcon = (fileName: string): JSX.Element => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon sx={{ color: "red" }} />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon sx={{ color: "green" }} />
      case "doc":
      case "docx":
        return <DescriptionIcon sx={{ color: "blue" }} />
      case "xls":
      case "xlsx":
        return <DescriptionIcon sx={{ color: "green" }} />
      default:
        return <InsertDriveFileIcon />;
    }
  }

  // Handle click on a file to open its URL
  const handleClickItem = (attachment: IFileInfo): void => {
    console.log(attachment)
    window.open(`${attachment['odata.id'].split('/sites')[0]}${attachment.ServerRelativeUrl}`, "_blank"); // Opens the file URL in a new tab
  }

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <Paper sx={{ padding: 3, maxWidth: 500, margin: "auto", textAlign: "center" }}>
        {/* Drag & Drop Input */}
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed gray",
            padding: 3,
            cursor: "pointer",
          }}
        >
          <input {...getInputProps()} />
          {LocaleStrings.DataDisplays.DragNDropUpload}
        </Box>

        {/* File List */}
        <List sx={{ marginTop: 2 }}>
          {attachments.map((attachment, index) => (
            <ListItem
              key={attachment.Name}
              onClick={() => handleClickItem(attachment)}
              sx={{
                "&:hover": {
                  backgroundColor: "#f0f0f0", // Background color on hover
                  cursor: "pointer", // Make it clear that it's clickable
                },
              }}
              secondaryAction={
                <IconButton edge="end" onClick={() => removeAttachment(attachment)} color="error">
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>{getFileIcon(attachment.Name)}</ListItemIcon>
              <ListItemText primary={attachment.Name} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </>
  )
}

export default ListAttachments
