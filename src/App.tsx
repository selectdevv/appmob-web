import { useEffect, useRef, useState } from 'react'
import type {
  ChangeEvent,
  FormEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
} from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import html2canvas from 'html2canvas'
import emailjs from '@emailjs/browser'
import bg from './assets/background_publimoov.png'
import './App.css'

type NullableInputRef = MutableRefObject<HTMLInputElement | null>
type NullableUrlRef = MutableRefObject<string | null>

const EMAIL_RECIPIENT = 'felipepinto.fpm@gmail.com'
const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? ''
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? ''
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? ''

function revokePreview(previewRef: NullableUrlRef) {
  if (previewRef.current) {
    URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
  }
}

function App() {
  const [companyName, setCompanyName] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [information, setInformation] = useState<string>('')
  const [logoFileName, setLogoFileName] = useState<string>('')
  const [productFileName, setProductFileName] = useState<string>('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [productPreview, setProductPreview] = useState<string | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false)
  const [contactFormValues, setContactFormValues] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })
  const [contactFormErrors, setContactFormErrors] = useState({
    name: false,
    email: false,
    whatsapp: false,
  })

  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const productInputRef = useRef<HTMLInputElement | null>(null)
  const logoPreviewRef = useRef<string | null>(null)
  const productPreviewRef = useRef<string | null>(null)
  const presentationRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => () => revokePreview(logoPreviewRef), [])
  useEffect(() => () => revokePreview(productPreviewRef), [])

  const handleFileChange =
    (
      setter: (value: string) => void,
      previewSetter: (value: string | null) => void,
      previewRef: NullableUrlRef,
    ) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        revokePreview(previewRef)

        if (file) {
          const nextUrl = URL.createObjectURL(file)
          setter(file.name)
          previewSetter(nextUrl)
          previewRef.current = nextUrl
        } else {
          setter('')
          previewSetter(null)
        }
      }

  const clearFile = (
    setter: (value: string) => void,
    inputRef: NullableInputRef,
    previewSetter: (value: string | null) => void,
    previewRef: NullableUrlRef,
  ) => {
    setter('')
    previewSetter(null)
    revokePreview(previewRef)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClearClick =
    (
      setter: (value: string) => void,
      inputRef: NullableInputRef,
      previewSetter: (value: string | null) => void,
      previewRef: NullableUrlRef,
    ) =>
      (event: ReactMouseEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        clearFile(setter, inputRef, previewSetter, previewRef)
      }

  const handleFileButtonClick =
    (inputRef: NullableInputRef) => () => {
      inputRef.current?.click()
    }

  const capturePresentationAsImage = async () => {
    if (!presentationRef.current) {
      return null
    }
    try {
      const canvas = await html2canvas(presentationRef.current, {
        useCORS: true,
        backgroundColor: '#f0f4ff',
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Falha ao gerar imagem da apresentação', error)
      return null
    }
  }

  const downloadPresentationImage = (dataUrl: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `publimoov-apresentacao-${Date.now()}.png`
    link.click()
  }

  const sendPresentationByEmail = async (dataUrl: string) => {
    if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_PUBLIC_KEY) {
      console.error('Configurações do EmailJS ausentes. Verifique as variáveis de ambiente.')
      return false
    }

    try {
      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        {
          to_email: EMAIL_RECIPIENT,
          company_name: companyName || 'Nome da empresa',
          information: information || 'Informações do produto',
          price: formatPrice(value) || 'R$ 0,00',
          customer_name: contactFormValues.name,
          customer_email: contactFormValues.email,
          customer_whatsapp: contactFormValues.whatsapp,
          attachments: [
            {
              name: `publimoov-apresentacao-${Date.now()}.png`,
              data: dataUrl,
            },
          ],
        },
        {
          publicKey: EMAIL_PUBLIC_KEY,
        },
      )
      return true
    } catch (error) {
      console.error('Falha ao enviar email com a apresentação', error)
      return false
    }
  }

  const handleOpenContactModal = () => {
    setContactModalOpen(true)
  }

  const resetContactForm = () => {
    setContactFormValues({
      name: '',
      email: '',
      whatsapp: '',
    })
    setContactFormErrors({
      name: false,
      email: false,
      whatsapp: false,
    })
  }

  const handleCloseContactModal = () => {
    setContactModalOpen(false)
    resetContactForm()
  }

  const handleContactFormChange =
    (field: 'name' | 'email' | 'whatsapp') =>
      (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value
        setContactFormValues((previous) => ({
          ...previous,
          [field]: nextValue,
        }))
        setContactFormErrors((previous) => ({
          ...previous,
          [field]: nextValue.trim() === '',
        }))
      }

  const handleSubmitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedValues = Object.fromEntries(
      Object.entries(contactFormValues).map(([key, value]) => [
        key,
        value.trim(),
      ]),
    ) as typeof contactFormValues

    const errors = {
      name: trimmedValues.name === '',
      email: trimmedValues.email === '',
      whatsapp: trimmedValues.whatsapp === '',
    }

    setContactFormErrors(errors)

    const hasError = Object.values(errors).some(Boolean)
    if (hasError) {
      return
    }

    const dataUrl = await capturePresentationAsImage()
    if (!dataUrl) {
      return
    }

    downloadPresentationImage(dataUrl)
    const emailSent = await sendPresentationByEmail(dataUrl)

    if (emailSent) {
      handleCloseContactModal()
    } else {
      window.alert('Não foi possível enviar o email. Verifique as configurações e tente novamente.')
    }
  }

  const formatPrice = (rawValue: string) => {
    if (!rawValue) return ''
    const numericValue = Number(rawValue)
    if (Number.isNaN(numericValue)) {
      return rawValue
    }
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
  }

  return (
    <main className="min-h-screen flex justify-center items-stretch bg-gray-50">
      <div className="w-1440 min-h-screen flex">
        <div className="w-1/2 flex items-center justify-center bg-white">
          <Box
            component="form"
            sx={{
              width: '100%',
              maxWidth: 480,
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 3,
              boxShadow: 3,
            }}
            noValidate
            autoComplete="off"
          >
            <Typography
              color="#5f5f5f"
              variant="h6"
              component="h2"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Informações
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="NOME DA EMPRESA"
                variant="outlined"
                fullWidth
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />

              <TextField
                label="INFORMAÇÕES"
                variant="outlined"
                fullWidth
                value={information}
                onChange={(event) => setInformation(event.target.value)}
              />

              <TextField
                label="VALOR"
                type="number"
                variant="outlined"
                fullWidth
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />

              <FormControl>
                <input
                  type="file"
                  accept="image/png"
                  hidden
                  onChange={handleFileChange(
                    setLogoFileName,
                    setLogoPreview,
                    logoPreviewRef,
                  )}
                  ref={logoInputRef}
                />
                <Button
                  variant="outlined"
                  onClick={handleFileButtonClick(logoInputRef)}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'text.secondary',
                    height: 56,
                    px: 2,
                    display: 'flex',
                  }}
                >
                  <span>{logoFileName || 'Logo da empresa'}</span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleClearClick(
                      setLogoFileName,
                      logoInputRef,
                      setLogoPreview,
                      logoPreviewRef,
                    )}
                    disabled={!logoFileName}
                    component="span"
                    sx={{ ml: 1 }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Button>
              </FormControl>

              <FormControl>
                <input
                  type="file"
                  accept="image/png"
                  hidden
                  onChange={handleFileChange(
                    setProductFileName,
                    setProductPreview,
                    productPreviewRef,
                  )}
                  ref={productInputRef}
                />
                <Button
                  variant="outlined"
                  onClick={handleFileButtonClick(productInputRef)}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'text.secondary',
                    height: 56,
                    px: 2,
                    display: 'flex',
                  }}
                >
                  <span>{productFileName || 'Foto real do produto'}</span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleClearClick(
                      setProductFileName,
                      productInputRef,
                      setProductPreview,
                      productPreviewRef,
                    )}
                    disabled={!productFileName}
                    component="span"
                    sx={{ ml: 1 }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Button>
              </FormControl>

              <Button type="button" variant="contained" onClick={handleOpenContactModal}>
                Enviar
              </Button>
            </Stack>
          </Box>
        </div>

        <div
          className="w-1/2 h-screen flex items-center justify-center"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundColor: '#f0f4ff',
          }}
          ref={presentationRef}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Box
              sx={{
                position: 'absolute',
                top: '35%',
                left: '8%',
                width: 230,
                minHeight: 110,
                // bgcolor: 'rgba(255,255,255,0.85)',
                // borderRadius: 3,
                // boxShadow: 3,
                px: 3,
                py: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant="body1" sx={{ color: '#000', fontWeight: 600 }}>
                {information || 'Informações do produto'}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: '38%',
                left: '13%',
                // bgcolor: '#002c67',
                // boxShadow: 2,
                // borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                px: 4,
                py: 1.5,
                gap: 1.5,
              }}
            >
              <Typography variant="body1" sx={{ color: '#000', fontWeight: 700 }}>
                {companyName || 'Nome da empresa'}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                right: '33%',
                width: 80,
                height: 80,
                // bgcolor: 'rgba(0,0,0,0.8)',
                // borderRadius: '50%',
                // boxShadow: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 700 }}>
                {formatPrice(value) || 'R$ 0,00'}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: '38%',
                right: '12%',
                width: 125,
                height: 125,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {productPreview ? (
                <img
                  src={productPreview}
                  alt="Foto real do produto"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: '#000', fontWeight: 600, textAlign: 'center' }}
                >
                  Foto real do produto
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: '30%',
                right: '17%',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo da empresa"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: '#000', fontWeight: 600, textAlign: 'center' }}
                >
                  Logo da empresa
                </Typography>
              )}
            </Box>
          </div>
        </div>
      </div>

      <Dialog
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="contact-dialog-title"
      >
        <DialogTitle id="contact-dialog-title">
          Informações de contato
        </DialogTitle>
        <form onSubmit={handleSubmitContactForm} noValidate>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 360 }}
          >
            <TextField
              label="Nome"
              variant="outlined"
              value={contactFormValues.name}
              onChange={handleContactFormChange('name')}
              required
              error={contactFormErrors.name}
              helperText={contactFormErrors.name ? 'Campo obrigatório' : ' '}
            />
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              value={contactFormValues.email}
              onChange={handleContactFormChange('email')}
              required
              error={contactFormErrors.email}
              helperText={contactFormErrors.email ? 'Campo obrigatório' : ' '}
            />
            <TextField
              label="Whatsapp"
              variant="outlined"
              value={contactFormValues.whatsapp}
              onChange={handleContactFormChange('whatsapp')}
              required
              error={contactFormErrors.whatsapp}
              helperText={contactFormErrors.whatsapp ? 'Campo obrigatório' : ' '}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseContactModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Enviar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </main>
  )
}

export default App
