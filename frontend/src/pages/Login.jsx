import { useState } from 'react';
import { 
  Button, CssBaseline, TextField, Paper, Box, Grid, Typography, 
  Alert, Avatar, Link 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const response = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', response.data.token);
    
    // Rolü ve Bloğu kaydet
    if(response.data.user) {
      localStorage.setItem('userBlock', response.data.user.block_name || 'A');
      localStorage.setItem('userRole', response.data.user.role);
    }

    alert('Giriş Başarılı! 🚀');
    navigate('/dashboard'); 
  } catch (err) {
    setError(err.response?.data?.error || 'Giriş başarısız!');
  }
};

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Modern Koyu Mavi Tema
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexDirection: 'column'
          }}
        >
          
          <Typography variant="h3" fontWeight="bold">Yurt Otomasyon</Typography>
          <Typography variant="h6">Çamaşırhane Randevu Sistemi</Typography>
        </Grid>
        
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Giriş Yap
            </Typography>
            
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

            <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal" required fullWidth label="Kullanıcı Adı" autoFocus
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth label="Şifre" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit" fullWidth variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                GİRİŞ YAP
              </Button>
              <Grid container>
                <Grid item xs>
                  {/* Boşluk */}
                </Grid>
                <Grid item>
                  <Link 
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/register')} // Kayıt sayfasına git
                  >
                    {"Hesabın yok mu? Kayıt Ol"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;