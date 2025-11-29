import { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, TextField, Button, 
  MenuItem, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Box, Alert, Chip, Tooltip, Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import BugReportIcon from '@mui/icons-material/BugReport';
import DoneAllIcon from '@mui/icons-material/DoneAll'; 
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
  const [machines, setMachines] = useState([]);
  const [stats, setStats] = useState([]);
  const [reports, setReports] = useState([]); 
  const [blockName, setBlockName] = useState('A');
  const [type, setType] = useState('wash');
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      // 1. Makineleri Çek
      const machinesRes = await api.get('/appointments/machines'); 
      setMachines(machinesRes.data);

      // 2. İstatistikleri Çek
      const statsRes = await api.get('/appointments/admin/stats');
      const formattedStats = statsRes.data.map(item => ({
        name: item.type === 'wash' ? 'Çamaşır' : 'Kurutma',
        RandevuSayisi: parseInt(item.count)
      }));
      setStats(formattedStats);

      // 3. Arıza Raporlarını Çek
      const reportsRes = await api.get('/appointments/admin/reports');
      setReports(reportsRes.data);

    } catch (err) { console.error("Veri çekme hatası", err); }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments/machine', { blockName, type, machineNumber: parseInt(number) });
      setMessage('Makine Eklendi! ✅');
      setNumber('');
      fetchAllData();
    } catch (err) { setMessage('Hata: ' + (err.response?.data?.error || 'Eklenemedi')); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Bu makineyi silmek istediğine emin misin?')) return;
    try { await api.delete(`/appointments/machine/${id}`); fetchAllData(); } catch (err) { alert('Silinemedi'); }
  };

  const toggleStatus = async (machine) => {
    const newStatus = machine.status === 'active' ? 'maintenance' : 'active';
    try { await api.patch(`/appointments/machine/${machine.id}/status`, { status: newStatus }); fetchAllData(); } catch (err) { alert('Durum güncellenemedi'); }
  };

  // Arızayı Çözüldü İşaretle 
  const resolveReport = async (id) => {
    if(!window.confirm('Bu arızanın giderildiğini onaylıyor musunuz?')) return;
    try {
      await api.delete(`/appointments/admin/reports/${id}`);
      setMessage('Arıza kaydı kapatıldı. ✅');
      fetchAllData();
    } catch (err) {
      alert('İşlem başarısız');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>Yönetici Paneli</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {/* 1. GRAFİK ALANI */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Kullanım İstatistikleri 📊</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="RandevuSayisi" fill="#8884d8" name="Toplam Randevu" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* 2. ARIZA BİLDİRİMLERİ LİSTESİ */}
        {reports.length > 0 && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: '#fff4e5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BugReportIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" color="error">Aktif Arıza Bildirimleri ({reports.length})</Typography>
            </Box>
            <List>
              {reports.map((r) => (
                <ListItem 
                  key={r.id} 
                  sx={{ bgcolor: 'white', mb: 1, borderRadius: 1, boxShadow: 1 }}
                  secondaryAction={
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      startIcon={<DoneAllIcon />}
                      onClick={() => resolveReport(r.id)}
                    >
                      Çözüldü
                    </Button>
                  }
                >
                  <ListItemText 
                    primary={
                      <Typography fontWeight="bold">
                        {r.type === 'wash' ? 'Çamaşır' : 'Kurutma'} {r.machine_number} - {r.block_name} Blok
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Sorun: {r.description}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          Bildiren: {r.username} | Tarih: {new Date(r.created_at).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Grid container spacing={4}>
          {/* 3. EKLEME FORMU */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Yeni Makine Ekle</Typography>
              <Box component="form" onSubmit={handleAdd}>
                <TextField select fullWidth label="Blok" margin="normal" value={blockName} onChange={e => setBlockName(e.target.value)}>
                  <MenuItem value="A">A Blok</MenuItem>
                  <MenuItem value="B">B Blok</MenuItem>
                </TextField>
                <TextField select fullWidth label="Tür" margin="normal" value={type} onChange={e => setType(e.target.value)}>
                  <MenuItem value="wash">Çamaşır Makinesi</MenuItem>
                  <MenuItem value="dry">Kurutma Makinesi</MenuItem>
                </TextField>
                <TextField fullWidth label="No" type="number" margin="normal" value={number} onChange={e => setNumber(e.target.value)} />
                <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2 }}>EKLE</Button>
              </Box>
            </Paper>
          </Grid>

          {/* 4. MAKİNE LİSTESİ */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Mevcut Makineler</Typography>
              <List>
                {machines.map(m => (
                  <ListItem key={m.id} sx={{ borderBottom: '1px solid #eee' }} secondaryAction={
                    <Box>
                      <Tooltip title={m.status === 'active' ? "Bakıma Al" : "Aktif Et"}>
                        <IconButton onClick={() => toggleStatus(m)} color={m.status === 'active' ? "warning" : "success"} sx={{ mr: 1 }}>
                          {m.status === 'active' ? <BuildIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil"><IconButton edge="end" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon /></IconButton></Tooltip>
                    </Box>
                  }>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {`${m.type === 'wash' ? 'Çamaşır' : 'Kurutma'} ${m.machine_number}`}
                          <Chip label={m.status === 'active' ? 'AKTİF' : 'BAKIMDA'} color={m.status === 'active' ? 'success' : 'error'} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                      } 
                      secondary={`Blok: ${m.block_name}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminPanel;