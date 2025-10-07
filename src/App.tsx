import './App.css'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'

function App() {
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
            <Typography color='#5f5f5f' variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              Informações
            </Typography>
            <Stack spacing={2.5}>

              <TextField label="Nome da Marca" variant="outlined" fullWidth />

              <TextField
                label="Logo"
                type="file"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />


              <TextField label="Preço" type="number" variant="outlined" fullWidth />

              <TextField
                label="Foto Real do Produto"
                type="file"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <Button type="submit" variant="contained">
                Enviar
              </Button>
            </Stack>
          </Box>
        </div>
        <div className="w-1/2 flex items-center justify-center bg-blue-100">
          <div className="text-gray-600">Conteúdo disponível para outras informações</div>
        </div>
      </div>
    </main>
  )
}

export default App
