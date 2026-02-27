import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'

interface BackIconButtonProps {
  onClick: () => void
  ariaLabel?: string
}

const BackIconButton = ({ onClick, ariaLabel = 'Voltar' }: BackIconButtonProps) => {
  return (
    <IconButton
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      sx={{
        border: '1px solid #c7d2fe',
        borderRadius: '10px',
        width: 42,
        height: 42,
        color: '#334155',
      }}
    >
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  )
}

export default BackIconButton
