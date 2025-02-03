import { Stepper, Step, StepLabel, Stack, Typography } from '@mui/material'
import * as React from 'react'
import { FC } from 'react'
import StepConnector from '@mui/material/StepConnector'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IHeaderDisplayProps {
  libTitle: string
  docTitle: string
  docState: string
}

const HeaderDisplay: FC<IHeaderDisplayProps> = (props) => {

  const DisplaySteps = (): JSX.Element[] => {
    const stepNames = ['Nový']
    let stepPos = 0
    if (['V pripomienkovaní', 'Spripomienkovaný'].indexOf(props.docState) !== -1) {
      stepNames.push(props.docState)
      stepPos = 1
    }
    else {
      stepNames.push('Pripomienkovanie')
    }
    if (['V schvaľovaní', 'Schválený', 'Zamietnutý'].indexOf(props.docState) !== -1) {
      stepNames.push(props.docState)
      stepPos = 2
    }
    else {
      stepNames.push('Schvaľovanie')
    }
    if (['Platný', 'Archívny'].indexOf(props.docState) !== -1) {
      stepNames.push(props.docState)
      stepPos = 3
    }
    else {
      stepNames.push('Publikovanie')
    }

    return stepNames.map((stepName, index) => {
      return (
        <Step completed={index < stepPos} active={index === stepPos} key={stepName}>
            <StepLabel sx={{fontSize: '10px'}} StepIconComponent={(props: any) => StepIcon(index < stepPos, index === stepPos, stepName)}>{stepName}</StepLabel>
        </Step>
      )
    })
  }

  function StepIcon(completed: boolean, active: boolean, stepName: string): JSX.Element {
    let color: "inherit" | "error" | "disabled" | "action" | "success" | "warning" | "primary" | "secondary" | "info" = 'disabled'
    if (completed || active){
      color = 'success'
    }
    if (['V pripomienkovaní', 'V schvaľovaní'].indexOf(stepName) !== -1){
      color = 'warning'
    }
    if (['Zamietnutý'].indexOf(stepName) !== -1){
      color = 'error'
    }

    if (completed) {
      return (
        <CheckOutlinedIcon color={color} />
      )
    }

    if (active) {
      return (
        <PriorityHighOutlinedIcon color={color} />
      )
    }
  
    return (
      <CloseOutlinedIcon color={color} />
    )
  }

  return (
    <>
      <Stack spacing={2} sx={{width: '100%', margin: '0.5rem', alignItems: 'center'}} direction="row" useFlexGap flexWrap="wrap" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          {`${props.libTitle.toUpperCase()}: ${props.docTitle}`}
        </Typography>
        <Stepper alternativeLabel sx={{width: '100%', maxWidth: '40rem'}} connector={<StepConnector sx={{height: '5px'}} />} >
          {DisplaySteps()}
        </Stepper>
      </Stack>
    </>
  )
}

export default HeaderDisplay
