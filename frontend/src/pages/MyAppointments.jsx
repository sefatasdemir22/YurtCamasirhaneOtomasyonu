import { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, List, ListItem, ListItemText, 
  IconButton, Chip, AppBar, Toolbar, Box, Alert, Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my-appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Randevuyu iptal etmek istediğine emin misin?')) return;
    try {
      await api.delete(`/appointments/cancel/${id}`);
      setMessage('Randevu iptal edildi. ✅');
      fetchAppointments(); 
    } catch (err) {
      setMessage('İptal edilemedi.');
    }
  };

  // Randevuları Aktif ve Geçmiş diye ayır
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // 2023-11-29 formatı
  
  // Basit tarih karşılaştırması
  const upcoming = appointments.filter(app => app.date >= todayStr);
  const past = appointments.filter(app => app.date < todayStr);

  const renderRow = (app, isPast) => (
    <ListItem 
      key={app.id} 
      sx={{ 
        borderBottom: '1px solid #eee', 
        bgcolor: isPast ? '#f9f9f9' : 'white',
        opacity: isPast ? 0.7 : 1
      }}
      secondaryAction={
        !isPast && (
          <IconButton edge="end" color="error" onClick={() => handleCancel(app.id)}>
            <DeleteIcon />
          </IconButton>
        )
      }
    >
      <Box sx={{ mr: 2 }}>
        {isPast ? <HistoryIcon color="disabled" fontSize="large" /> : <EventIcon color="primary" fontSize="large" />}
      </Box>
      <ListItemText
        primary={
          <Typography variant="h6" sx={{ textDecoration: isPast ? 'line-through' : 'none' }}>
            {app.type === 'wash' ? 'Çamaşır' : 'Kurutma'} Makinesi {app.machine_number}
          </Typography>
        }
        secondary={
          <>
            <Typography component="span" variant="body2" color="text.primary">
              Tarih: {new Date(app.date).toLocaleDateString()}
            </Typography>
            <br />
            Saat: {app.slot_start.substring(0,5)} - {app.slot_end.substring(0,5)} | Blok: {app.block_name}
          </>
        }
      />
      <Chip 
        label={isPast ? "Tamamlandı" : "Bekliyor"} 
        color={isPast ? "default" : "success"} 
        size="small" 
      />
    </ListItem>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>Randevularım</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        
        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          {/* AKTİF RANDEVULAR */}
          <Box sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" color="primary" fontWeight="bold">Aktif Randevularım</Typography>
          </Box>
          <List disablePadding>
            {upcoming.length > 0 ? upcoming.map(app => renderRow(app, false)) : <Typography p={2}>Aktif randevunuz yok.</Typography>}
          </List>

          <Divider />

          {/* GEÇMİŞ RANDEVULAR */}
          <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" color="text.secondary" fontWeight="bold">Geçmiş Randevular</Typography>
          </Box>
          <List disablePadding>
            {past.length > 0 ? past.map(app => renderRow(app, true)) : <Typography p={2}>Geçmiş kaydı yok.</Typography>}
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default MyAppointments;