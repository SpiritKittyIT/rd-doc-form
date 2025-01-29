import { Stepper, Step, StepLabel, Stack } from '@mui/material'
import * as React from 'react'
import { FC } from 'react'
import StepConnector from '@mui/material/StepConnector'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { Contains } from '../../help/helperFunctions'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IHeaderDisplayProps {
  libTitle: string
  docTitle: string
  docState: string
}

const HeaderDisplay: FC<IHeaderDisplayProps> = (props) => {
  const [special, setSpecial] = React.useState<boolean>(false)
  const ahegaoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBISEhgSFBUZFBgZFBsZHBgZGRIaHR0UGxkaGRobGRobIC0xGx0pHhoaJTcnKS4wNDQ0GiM5PzkyPi0yNTABCwsLDw8PEA8RETIcGBwwMDAwPjIwMDAwMDAwMDAwMDAwMDAwMjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMP/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABAUCAwYBBwj/xABCEAACAgEDAQYDBQUFBQkAAAABAgARAwQSITEFEyJBUWEGcYEHFDJCkSNSYnKhFTNDkrGCorLR8BYkVGNkc4PBwv/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/APs0REBERAREQEREBERAREQEREBERARMAwN15Gj7Gr/0I/WZwEREBERAREQEREBERAREQEREBERARExYgCzwIGUREBE1ZcqopZmCqOpJAA+ZMqNZ8R4UW8QbUt5DEAVPucjEIAOvLXXQGBdE1zOeza3Jq8gxabI2LGCGbOgQsU8hj3qwpjwGI5AYjgAtBGXU9oGgFTD5kW2Mj+YgfeDXQKBjFtuLlQJ0uh0aYV2LfW2Ym2Zj1Zj5ngewAAFAAQMezM7OlOQXQ7HrgbwAbA8gylWA8gwk6RhgrLvBq02sPWjan2q2HvY9JJgIiIFfrMvct3x/BQD/AMNdMnyF03tR/LzX/wBuuB3pwM+nLMoyYmGRgFZk3tjAH7M1YKl+CCQOaviLmOPGFAVQAAKAAAAA6AAdBAq8PxDpGAPebFIBDOuTGpB6U7qFN+xlsDfMpdd2CjkvibuMhJJKi0ZjfL47FnnllKsaHiqUa5dR2e3iQIl8gG8D3f4Xofd8nQ+IBCWq2J3AO4iQtBrkzpvQ9DtYEUyuKtWHkeQfcEEWCDJsBERAREQEREBERAREQEREBK/tXS5MqbMeRcdkh9yb9yMrKVA3LTcggmx4eQZLyZFRSzEKqgkkkABRySSegkAZMuf8BOLH++QO8b+RWFIvTxMCTz4RwxDdqddjwAB2JNcKAzuwHBKogLN70JU59V2jmJGHAunTnx5si94fQoiK6p629nyKiXOk0WPFexaJ/ExLMzEdCzsSWPzJkuByn/ZzO5DvkQuDe51yZmHqELMmy/4QB7Sww/D2EG8pbObun27PIj9moCmiLBYEj1l3ImTXIpI8TEcEIrvR9DsB2n51AlT2Uv8Abihtr48uPnguqjd7ooYlunNCx1Iq6tcGZXRXU2rAEH1B6GBtiIgIiICIiAmLAEUebmUQOW1fYGTTv947PKowAD6diRiyIPyqR/dMPykAqpvwjc13HZPaaalCygqyna+NxT48gFlHXyPNg9CCCCQQZYyq13Zm/IM+Ju6zqu3fRKul3syqCN62SQbBUk0eWBC1iVOPtbZxqEOnI6sTuxHgWVzAAAWaG8Ixr8MskcMAQQQeQRyCPYwNkREBERAREQEREBERA05cSuKYWAQaPSwbFj2NH6CbonhMD2JrXIp6EH5EGQ865qZjkVFAJpcZLADn8TMQf8sCwiVOmxd4WA1WRyr0wvACpqwCExggEEEX1BBB5m1+y8fFtl6/+I1I/oH5HtAmZcaupVgGUiiCAQR6EHrMdNhVF2r0skck9ST+nMjN2Vi6jep9Vy5l/Xa3i+tzPR6d0sF96/lBVQR62VoHn0A/5hNiIgIiICU/bfaOXEBjwY++zOPCDuCKoIBbIwHAsgADkk+ShmW4kPU9o4cRrI4Ti+Q1V86qBWH4fGUXqHbI38JZCPk6ncp/kKr57b5kkdlsigYc+VKHAdmzqfTf3hLkfyup95sw9uaRyVTUYnYdVR0dv8qkn+knYsisNykEeogYacPXjKk+qhgP0JM3xEBNGPTY0JZUVSepCgE/OuvSb4gIiICIiAiIgIiICIlH8T9tZNDh78ad9RjX8fdsN6jybaR4l9SDY61VkBI7V7Zw6Zd2VgosC2ZEWz5b8hUE+wJPtOP7W+0XSIh/71g6H9nix5dSzD0DE41Un+Licf8AFHx2/bCfcNHo2LZWUbmKs+1XV6UDhBuVSWLUAD06jP4Y+zxBkOPUL3uZGIbFdIlUQx/fBG1gTQpwKuBxevzajtDVvqNNiyWWFd0lEAClLHGAFY1f/Pqet7Iz/FGFdiOxX/zn0z19XJYfLpO6Gly4x3ePTttUlQE7hFFceFXdePkKmpdTYvnqR0PUGiPfn04lHGYez+2tu3Ji02egVVnZVdEJLbEfCyMqAnhQaXgAAAVo7O7N1mmzFsvZuHPiYgsr93qWXiicRLlwOBwd3mR1qd9hyb3GMEbyCQpJsgfIGh5X05EkP2ZlXG2Rs3jVWbaFQYqFmmsF+nBbePXb+WBR6Xt7Dibbg7N1KNwL0LZGxhiAadGCbGF/hyYwfOqNntOwtbnycOudK6rqMWNXPTlXwtsrnpV9fQyH2BolCZM+Vdpy7F2vxtx4y2zdfRt75Gv0ZfSXmFwFAW6Aobi5NDjktyfmZBN3RukB9UAavk9AOSfp6e/SenUgC2O35kdfT5wJ9z2REzgi+g9wR+t9Jli1AbpyPXyPyPn8xxA2ZchVSQpavJdtn5WQP6yo1HxFpUBOQZcYWyWfTasKoXksXOPaAPW6lrkYEFbPIrgkH9R0+c4P427ATVA6bEMuXKQCzPl1T48K8HcE37TlPFL6HcSONwXOs+Keys2JlOr0zeE0GyYLuuKVzRPsePXicl2L8ZdlOxxZHOiyoxXfp3ypp3az4lCEpXnWRSBfDN1NDj+z3RgU2TOWrqGxKPnRxmv1mjUfZ1gI/Z58iH+Ncbj+m2IPrGDXZVTvMWpwa3Eq2WZseNgo5ZzlxAoeOa2IPVhLDQdr48u0U2N2Wwj7QSKu0ZSVyCvNGYCfAMvwZr9LkGTTZA7KeGxuceQe9MR+gYyb2F8bavs1fuur0oy4C5cI6lCpLbj3RrbtDWwUCgTwRA/Q0Tj/AIV+J8GsW9Ll7yhbafMduZBxdMb7xfc3ZPL+U6xGsWQRY6GrHsaJgbIiICIiAiIgIiICcV9oHwpn1+MNptTkw5AKKd5lGLIv7rKDSN6MBz0N8EdmTUr82tNnaBQ6sx2gcXZ9BX19gDugfNvsr7M1nZ2fJp9TomUZORqRtbaVH92zKTaGrFdD1Bvw9b8bHWJiGbRZCMisGbCAp7/GpDMiWCd9A/h5IJHPhqwLt+IsRfG9h4j57cePnaOPMEmujfilbp1xjJuyDKcy5HbulDEOu8nAzOR+FUVfzhAxbdzA1v24Qhc4MuOkV9uQIHIchVVcKM2RnLHaAVUEgix1mGLFpcg3Npz37kHIv3RlYuRZDt+ANXFlyPcyUmEHIc+RgSx4XGCF37Npbf8Aiy5Ng22vRVIoAvullz+AAoAPwJt3V18bA1jHU8G/MHygaBo+6BGnTGlkEpjw41IJBNvWVQfn/rI2VcTq2HWM6NXiKDJ3bYwQ1Bl3BVJFFWCs1MKKk7p67mAA4X0Qsq+p8YG7IfPwgA82Zl3AUDcQovgBR+Lr4MYsXfPO9oEfs3Xu+NXyBixfJsZ1Ku2IOwxucYF7jj2E0o687egkZMjcF27sHooAZ29lUX+g3nzsTamJuSP2YPVjTZD6WTYHte7r0E9XGEsqAt8F3sk+g5Nt58Ej2gQ9Vqe4xPlI7pEUsxPjyNXAAFm3JoCyxJIFT3s5Mgx49w3ZBjQZMj7q7zaA5QHnbus0Nqm+sjdupfcWpa9ZhAbJ+9vtaTiqIB/KeB1lsyAHxW7enX5eEcD5n9YGCgHnnIfU8ID6gdPqLI9Zll1QQW7edcEKL9CxI59rF+kwyu10TtJFhVAdyPU3wo8ubH8U1d3tNn9mSOKvJkI/mYHj1ABA9YGwa56sKMafvN+zX/NkAI+iEe8g9oKNWyBMnGNnTMVLKuxlV22vVMwZcYPThnqiKG/MpUHu0VcrArjOQ737wg0SLJKCixAYcKeBNv3aqVWYY1HGwuGyO3id2bGQeSSeCASWJB8NBV4NJosm7CmNDtBJZdgYEmtwaw+4g33lc3+ImUOq34HOLJYN+ByAFyL5MpHG/wDeQcgjptKk9Tm0qZK2vkZlsDxF6XoVOSwR9HD2Bz1Bqe0uw82S+71WRcg4pDiypQrwvhysob/5Gc8cEXUCBpQcj92GUOVJVWNFyo3FU9W2gmvRT6GYa/QZDjZc2mZsf5r7lxXqUR2bjrdcdeKlxhyZNIoD6dDu4D6dAm4irD4Rbq3Whj7wGrsAyZqO2MK6bJqTudManvEVQ+RTQtHRSdpog01UDZoXLR8b7Z+Gn07DVaJ3FeMBWbennuxuDbCvr851Hwj9rmQFcGtTvLIVc2PYrWSAN6sQp68sCPkessdD8JavXsXff2bpXJYYQ2/UMG5Nlh+xBu9vNWRVVNHx79mmjxaRtTpSNOcOO2V3YpkUerMTtyHoPIkgUOog+qaLW48y70Ni6IIZWVhRKsrAFW5HBAPIkufC/gb7SMeILj1xdSqhF1KAsTjXlUzrzvA5AYAsNx6WWn2fs/tDDqU7zDkXIt1uUg0w6g+jDzB5ECbERAREQEREDTmNDzPsOv09JTZHsBiQFB4IsrZNju1/xHvoxHWqBsy21KqVpunmOefYgdR7ecg5dMXbcwI8toPNehYdAeLVeDXJI4AV6u7sRjU30LEjd15BeiMY4/CoY88hDzMkwiq4ezfIOzdxyqWTkbgeJia58QqpYLprFUAoFBQOK9CPP5dPnJC6YfP1vz+ft7dIFcuFmN8kngm+SPRsg6D+HGOo68yQmjUDmiBzVAKDd2F9b5s2b85PXHNgWBC7tj04/iI5+g/5/oZsx6YLz1J6seSR6X6e3SS6nsDQMc97oXdc9L9puiBEz6TG+0Ooba6ut+TqbVh7ibBhA6Cb4gRfu4F0Ks2arr6n1M0NpetGgetdT826/wD37yxnhEDne0dMSEONhjZMhdXK7gXKPjNLYLttckV5gWTyDmMR20R4QtW/ChQOP2d8j+cgiXRwi91C+l+del+kjPo1uz4iOhbmj6qOin3AuBWttYWd2QerELjr+gZfemmSu1AKaAHC41H6DI/hI+gkp8Ruwln1Y8/Q8n6cTU6kfievZQFv9bJPyMDBgSpDquwim7xt1jzBSite11A1GPEqhrOMrXek7wALpMh67KJpiSOoJBI3ebFHiCWR+dyQR7bmth+lTLeT+Yt/IKBH87Gj9CIGWHVK+PcRsWyF32AQCVViprggAgHmjOU7d+C37RcHU6zUZMata40THiRT0sbr3GifFTHk8+U6c0p/KjHzNu7D2vkn/NN2LCr/AItzj+PofmgofqsCu+GfhXs7Q0MOJTl83J7xx/tkeAcdAFHtOm2i7rk+fy6f6zDHtFKKHHCihx7D0m6AiIgIiICIiB4RMCk2RA1hJmBPZrxurKGUhgQCCCCCDyCCOogVWn1OTNqDQfGmJciOGRlD5Gde7ZWIp1CKzcWP2q3yCBcxEBERARKnX9rLjydzjVs+ag3dpXhQmg2RzxjXrV+JqO0NREh49T2s3P3bS4x+62pzM31K4aH9YHRRKIa/tBBeTRq//salHJ+mZMYH6zLH8RYAVXMH0rNQAzoUUseAoyi0Zr/KrkwLuIiAnhE9iBrZLmk6cC6FX5iv6+slTyoFc+mA5oEjzNkj5XI78+bN7LYF/wAw6fItLdkBkbUAAWfNgPqxCj+pgVgciwgRPoXa/dMfU/7RmwDzc5CPUsmJQfeirV7HdJZwk+Z+np/16VN2LTqp3UL/AHjyf8x5gNGqBfAqr67RwT7Ghu+clREBERAREQEREBERApvifKV0xUf4mXDgJBIIXPmx4WII6ELkJEtwtChxOd7cy96w0wZe8Gp0rqljd3ePNjzZHI6hdqsL6WoF2Z0kBERATmc/bGTVZW0uiYLsZly6lgCEZTTJhQ/3mQE8kjYvnuPhnTT4p8F50y5NTpsgBOPU5MqHcwencq4XbR2gqd3NEZKIo0Q+h6rtPQ9k4CWLkFrd1V8rvkNLuyuAfGTQtyPIDgUKDJ9r2hB8ODUt77cA/wBck1fEvZLarSNgxlUbwFbFLaMGC8fhBqunHpPjSNYB9RcD7Xi+13Qk02HUKPXbhP8Aw5Jb6b487I1SlG1GMAimXOrY1IPUHvAFYfUz8/xA/RSaLLpQH0R77AefuxYeFfXTZGPh9sbHZ0AKDrb9ndo49QhZCeDtZWBV0egSjo1FWog0R0IPQifm7sbtvVaJg+mytj5spZONvZ0PBv1q/Qz6t2X8VLrwup0+NsGpRVTIzHH3Tck91kAfeyGyUfZakmifGrB9JiUnYvb+PVM+La+PLjCl8bgcB72srraupo0Qb9QDxLuAiIgJzHaPaqvl+7qw7xddhVU/McYTHmdgPNdhfxdOCLvidPNXdLu3UN1VuoXtu6v0vygZ7Z6BPYgIiICIiAiIgIiICIiAiIgIiICflvtnGF1Wdf3dVmo9CCMr0QfI8T9ST82fG2m7vtPVJ/6hn+mQDJ/+4GLfFWtOHuO98OzZv2r3hWq5c+dcXV+98ykUUKE9iAiIgJu0mpfFkTLjNOjKw60drBtrAEWpIFiaZ6qsSFUFmJAVR1LE0oHuSQPrA+6/Zm76jHn17oEbPlVFUMWHdYF2CiQP8Q5T0853Mq/h7sz7ppMOmu+7xKpI4twPE31az9ZaQERK3tkuMYKKXIy4iwWt2xciM5UHrSgmupF1ZoELKJA7LfM6Fsq7CzuVW1JXHuOwMRxu20SOaJqzUnwEREBERAREQEREBERAREQEREBERAT4X9sGg7vtEZgPDmwK1+roSjfovd/rPuk+efa/2YMumwZPwnHqAC+0sExZFIdmA/Ku1WPskD492Z2fl1OQYsS2x59FVbALM3kov5noATxPpXY/wZpMCftEXUOerZFUrfoiGwo/U+8y+Cey8enTNjRw798LyeEBk7tGx7TZGzxuRyRZbmdM+B1/ErD5gj+so57WfCGgy/4K4z64icf+6vhP1BkPH8BaIfi71/5nr/gCzqpkijzJr2HP0/6/WEcnrPgLRuhGPfhauGDu4vy3JkY7h7Cj7iQPsv8AhTJl1Z1OZaTS5GUej6lCV4vqqHxX67fQidZqM76nMun0941bL3WTOvIxkI+RkxsR4821G55CGr5pZ22g0ePBiXDjXaiLSqPT3J6kmySeSSSZFTIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAlf2sgZFBAYd7jBBFghmCmx5imMsJGzspKo3VmsD3TxWfawP1EDk8vYOj3t3IzYXQBDqMKl95HGzKpVhmZehcqxFG3DXNP3XItj+0dIwB6PiZWHmA1ajrX8I+k7hVCigKA8hPSAYHABFawdeuTkDbodOcjg2bBJbMB8yornp5Z6bsL707JsyabHjZd7tlZ9U7kB+7GRXIwJtKkhSbVwBs5nWYcjJmOFiSrLuxk2enD4yfOrVhZshj5LMew23Jkcii2pzX06Y8jYlPH8ONYFb/Yz4tRiXBjVNPjdHUKxAR1x5sWQbK5DI6VR/ECTz16aIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAnM9s5iNWjGwMJwHi+RqcmTC1j0BRCfQWZ00rdb2VizZEyMG3J02u6hgGVgHVSAwDKrAH0PkSCFlERArO2uFxuPxLqcNe3eZFwt/uZHH1nvYNfd1r957/AJu8fd/W5520QFxlvw/ecN/M5FCf75UfWY/D39xY6NmzspHQo2oyMhHsVII9jAtYiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiBo1GBMiFHVXVhRVgGUj0IPBEzxoFAVQAAKAHAAHQAeQmyICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgf//Z'

  React.useEffect(() => {
    if (props.docTitle === 'ahegao.docx') {
      setSpecial(true)
      return
    }
  }, [props])

  const DisplaySteps = (): JSX.Element[] => {
    const stepNames = ['Návrh']
    let stepPos = 0
    if (Contains(['Spúšťa sa pripomienkovanie...', 'V pripomienkovaní', 'Pripomienky v zapracovaní', 'Spripomienkovaný'], props.docState)) {
      stepNames.push(props.docState)
      stepPos = 1
    }
    else {
      stepNames.push('Pripomienkovanie')
    }
    if (Contains(['Spúšťa sa schvaľovanie...', 'V schvaľovaní', 'Schválený', 'Zamietnutý'], props.docState)) {
      stepNames.push(props.docState)
      stepPos = 2
    }
    else {
      stepNames.push('Schvaľovanie')
    }
    if (Contains(['Platný', 'Archívny'], props.docState)) {
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
    let color = special ? 'var(--transparent-gray4)' : 'var(--gray2)'
    if (completed || active){
      color = special ? 'var(--transparent-green)' : 'var(--ugly-green)'
    }
    if (Contains(['Spúšťa sa pripomienkovanie...', 'Spúšťa sa schvaľovanie...'], stepName)){
      color = special ? 'var(--transparent-yellow)' : 'var(--ugly-yellow)'
    }
    if (Contains(['Zamietnutý'], stepName)){
      color = special ? 'var(--transparent-red)' : 'var(--ugly-red)'
    }

    if (special) {
      return (
        <div className='step-wrapper' style={{backgroundImage: `url("${ahegaoUrl}")`, backgroundSize: 'cover'}}>
          <div style={{width: '100%', height: '100%', background: color, borderRadius: 100}} />
        </div>
      )
    }

    if (completed) {
      return (
        <div className='step-wrapper' style={{background: color}}>
          <CheckOutlinedIcon />
        </div>
      )
    }

    if (active) {
      return (
        <div className='step-wrapper' style={{background: color}}>
          <PriorityHighOutlinedIcon />
        </div>
      )
    }
  
    return (
      <div className='step-wrapper' style={{background: color}}>
        <CloseOutlinedIcon />
      </div>
    )
  }

  return (
    <>
      <Stack spacing={2} sx={{width: '100%', margin: '0.5rem'}} direction="row" useFlexGap flexWrap="wrap" justifyContent="space-between">
        <h2>{`${props.libTitle.toUpperCase()}: ${props.docTitle}`}</h2>
        <Stepper alternativeLabel sx={{width: '100%', maxWidth: '40rem'}} connector={<StepConnector sx={{height: '5px'}} />} >
          {DisplaySteps()}
        </Stepper>
      </Stack>
    </>
  )
}

export default HeaderDisplay
