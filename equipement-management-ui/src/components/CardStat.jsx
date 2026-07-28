import { Box, Typography, useTheme } from '@mui/material';

export default function CardStat({
  title,
  value,
  subtitle,
  icon,
  colorKey = 'primary',
  trend,
}) {
  const theme = useTheme();
  const color = theme.palette[colorKey]?.main ?? theme.palette.primary.main;
  const bgColor = `${color}14`;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        p: 3,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 20px 48px ${color}22`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: '20px 20px 0 0',
        },
      }}
    >
      {/* Decorative blob */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: bgColor,
          filter: 'blur(20px)',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Icon + trend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              '& svg': { fontSize: 26 },
            }}
          >
            {icon}
          </Box>

          {trend !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                px: 1.2,
                py: 0.4,
                borderRadius: '8px',
                background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: trend >= 0 ? '#10b981' : '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Box>
          )}
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2rem', sm: '2.4rem' },
            color: theme.palette.text.primary,
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.25 }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
