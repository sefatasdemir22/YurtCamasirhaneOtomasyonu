import { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, TextField, Button, 
  MenuItem, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Box, Alert, Chip, Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build'; // Tamir ikonu
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Onay ikonu
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [machines, setMachines] = useState([]);
  const [blockName, setBlockName] = useState('A');
  const [type, setType] = useState('wash');
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchMachines = async () => {
    try {
      const res = await api.get('/appointments/machines'); 
      setMachines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments/machine', { 
        blockName, type, machineNumber: parseInt(number) 
      });
      setMessage('Makine Eklendi! ✅');
      setNumber('');
      fetchMachines();
    } catch (err) {
      setMessage('Hata: ' + (err.response?.data?.error || 'Eklenemedi'));
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Bu makineyi silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/appointments/machine/${id}`);
      fetchMachines();
    } catch (err) {
      alert('Silinemedi');
    }
  };

  // YENİ: Durum Değiştirme Fonksiyonu
  const toggleStatus = async (machine) => {
    const newStatus = machine.status === 'active' ? 'maintenance' : 'active';
    try {
      await api.patch(`/appointments/machine/${machine.id}/status`, { status: newStatus });
      fetchMachines(); // Listeyi yenile
    } catch (err) {
      alert('Durum güncellenemedi');
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

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Grid container spacing={4}>
          {/* EKLEME FORMU */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Yeni Makine Ekle</Typography>
              <Box component="form" onSubmit={handleAdd}>
                <TextField 
                  select fullWidth label="Blok" margin="normal"
                  value={blockName} onChange={e => setBlockName(e.target.value)}
                >
                  <MenuItem value="A">A Blok</MenuItem>
                  <MenuItem value="B">B Blok</MenuItem>
                </TextField>

                <TextField 
                  select fullWidth label="Tür" margin="normal"
                  value={type} onChange={e => setType(e.target.value)}
                >
                  <MenuItem value="wash">Çamaşır Makinesi</MenuItem>
                  <MenuItem value="dry">Kurutma Makinesi</MenuItem>
                </TextField>

                <TextField 
                  fullWidth label="Makine Numarası (Örn: 3)" type="number" margin="normal"
                  value={number} onChange={e => setNumber(e.target.value)}
                />

                <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2 }}>
                  EKLE
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* MAKİNE LİSTESİ */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Mevcut Makineler</Typography>
              <List>
                {machines.map(m => (
                  <ListItem 
                    key={m.id} 
                    sx={{ borderBottom: '1px solid #eee' }}
                    secondaryAction={
                      <Box>
                        {/* DURUM DEĞİŞTİRME BUTONU */}
                        <Tooltip title={m.status === 'active' ? "Bakıma Al" : "Aktif Et"}>
                          <IconButton 
                            onClick={() => toggleStatus(m)}
                            color={m.status === 'active' ? "warning" : "success"}
                            sx={{ mr: 1 }}
                          >
                            {m.status === 'active' ? <BuildIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>

                        {/* SİLME BUTONU */}
                        <Tooltip title="Sil">
                          <IconButton edge="end" color="error" onClick={() => handleDelete(m.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {`${m.type === 'wash' ? 'Çamaşır' : 'Kurutma'} ${m.machine_number}`}
                          <Chip 
                            label={m.status === 'active' ? 'AKTİF' : 'BAKIMDA'} 
                            color={m.status === 'active' ? 'success' : 'error'} 
                            size="small" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
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