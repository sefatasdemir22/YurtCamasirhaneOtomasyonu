import { useState, useEffect, useCallback } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, 
  CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Box, Alert, TextField, Paper, Stack 
} from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LogoutIcon from '@mui/icons-material/Logout';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings'; 
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [machines, setMachines] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [quota, setQuota] = useState({ washCount: 0, dryCount: 0 });
  const [takenSlots, setTakenSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const timeSlots = [
    { start: '09:00', end: '10:00' }, { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' }, { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' }, { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }, { start: '17:00', end: '18:00' },
    { start: '18:00', end: '19:00' }, { start: '19:00', end: '20:00' },
    { start: '20:00', end: '21:00' }, { start: '21:00', end: '22:00' },
  ];

  const fetchData = useCallback(async () => {
    try {
      const machinesRes = await api.get('/appointments/machines');
      setMachines(machinesRes.data);
      const quotaRes = await api.get(`/appointments/quota?date=${selectedDate}`);
      setQuota(quotaRes.data);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/');
    }
  }, [selectedDate, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = async (machine) => {
    setSelectedMachine(machine);
    setMessage({ type: '', text: '' });
    setSelectedSlot(null);
    setOpen(true);
    try {
      const res = await api.get(`/appointments/availability?machineId=${machine.id}&date=${selectedDate}`);
      setTakenSlots(res.data);
    } catch (error) {
      console.error("Müsaitlik durumu alınamadı");
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      setMessage({ type: 'warning', text: 'Lütfen bir saat seçiniz!' });
      return;
    }
    try {
      await api.post('/appointments/book', {
        machineId: selectedMachine.id,
        date: selectedDate,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end
      });
      setMessage({ type: 'success', text: 'Randevu Başarılı! 🎉' });
      fetchData(); 
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Hata oluştu.' });
    }
  };

  // Arıza Bildirimi Fonksiyonu
  const handleReport = async (machine) => {
    const desc = prompt("Sorun nedir? (Örn: Çalışmıyor, Su kaçırıyor)");
    if (!desc) return;
    try {
      await api.post('/appointments/report', { machineId: machine.id, description: desc });
      alert('Bildiriminiz yöneticiye iletildi. Teşekkürler! 🙏');
    } catch (err) {
      alert('Bildirim gönderilemedi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userBlock');
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1e293b' }}>
        <Toolbar>
          <LocalLaundryServiceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Yurt Otomasyon
          </Typography>
          
          {/* Randevularım Butonu */}
          <Button 
            color="inherit" 
            startIcon={<ListAltIcon />} 
            sx={{ mr: 2 }}
            onClick={() => navigate('/my-appointments')}
          >
            RANDEVULARIM
          </Button>

          {localStorage.getItem('userRole') === 'admin' && (
            <Button 
              color="secondary" variant="contained" startIcon={<SettingsIcon />} sx={{ mr: 2, fontWeight: 'bold' }}
              onClick={() => navigate('/admin')}
            >
              YÖNETİCİ PANELİ
            </Button>
          )}

          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Çıkış
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon color="primary" sx={{ fontSize: 30 }} />
                <TextField
                  label="Randevu Tarihi"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  // Geçmiş tarihi engelleme
                  inputProps={{ min: new Date().toISOString().slice(0, 10) }} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <Alert icon={<LocalLaundryServiceIcon fontSize="inherit" />} severity="info" sx={{ width: '100%' }}>
                  Kalan Yıkama Hakkı: <strong>{2 - quota.washCount} / 2</strong>
                </Alert>
                <Alert icon={<WbSunnyIcon fontSize="inherit" />} severity="warning" sx={{ width: '100%' }}>
                  Kalan Kurutma Hakkı: <strong>{2 - quota.dryCount} / 2</strong>
                </Alert>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
          {selectedDate} Tarihi İçin Müsait Makineler
        </Typography>

        <Grid container spacing={3}>
          {machines.map((machine) => (
            <Grid item key={machine.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                  {machine.type === 'wash' ? <LocalLaundryServiceIcon sx={{ fontSize: 70, color: '#2563eb', mb: 2 }} /> : <WbSunnyIcon sx={{ fontSize: 70, color: '#ea580c', mb: 2 }} />}
                  <Typography variant="h5" fontWeight="bold">{machine.type === 'wash' ? 'Çamaşır' : 'Kurutma'} {machine.machine_number}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Blok: {machine.block_name}</Typography>
                  <Chip label={machine.status === 'active' ? 'AKTİF' : 'BAKIMDA'} color={machine.status === 'active' ? 'success' : 'error'} size="small" />
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3, flexDirection: 'column', gap: 1 }}>
                  <Button variant="contained" fullWidth sx={{ mx: 2, bgcolor: machine.type === 'wash' ? '#2563eb' : '#ea580c' }} onClick={() => handleOpenModal(machine)} disabled={machine.status !== 'active'}>
                    SAAT SEÇ & RANDEVU AL
                  </Button>
                  
                  {/* Arıza Bildir Butonu */}
                  <Button size="small" color="error" startIcon={<ReportProblemIcon />} onClick={() => handleReport(machine)}>
                    Arıza Bildir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Saat Seçimi</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="subtitle1">{selectedMachine?.type === 'wash' ? 'Çamaşır' : 'Kurutma'} Makinesi {selectedMachine?.machine_number}</Typography>
            <Typography variant="body2" color="text.secondary">Tarih: {selectedDate}</Typography>
          </Box>
          {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
          <Grid container spacing={1}>
            {timeSlots.map((slot, index) => {
              const isTaken = takenSlots.includes(slot.start);
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <Grid item xs={4} sm={3} key={index}>
                  <Button variant={isSelected ? "contained" : "outlined"} color={isTaken ? "error" : "primary"} fullWidth disabled={isTaken} onClick={() => setSelectedSlot(slot)} sx={{ py: 1, textDecoration: isTaken ? 'line-through' : 'none', bgcolor: isTaken ? '#ffebee' : '' }}>
                    {slot.start}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ mr: 2 }}>Vazgeç</Button>
          <Button onClick={handleBook} variant="contained" size="large" disabled={!selectedSlot}>ONAYLA VE BİTİR</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;