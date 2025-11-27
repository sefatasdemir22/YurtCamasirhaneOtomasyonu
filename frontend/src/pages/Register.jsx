import { useState } from 'react';
import { 
  Button, CssBaseline, TextField, Paper, Box, Grid, Typography, 
  Alert, Avatar, MenuItem, Link 
} from '@mui/material';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [blockName, setBlockName] = useState('A'); // Varsayılan A Blok
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', { username, password, blockName });
      setSuccess('Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/'), 2000); // 2 saniye sonra Login'e at
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız!');
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item xs={false} sm={4} md={7}
          sx={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Yeşil Degrade
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column'
          }}
        >
          <Typography variant="h3" fontWeight="bold">Aramıza Katıl</Typography>
          <Typography variant="h6">Hızlıca Randevu Almaya Başla</Typography>
        </Grid>
        
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
              <AppRegistrationIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Hesap Oluştur
            </Typography>

            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}

            <Box component="form" noValidate onSubmit={handleRegister} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal" required fullWidth label="Kullanıcı Adı"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth label="Şifre" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth select label="Blok Seçiniz"
                value={blockName} onChange={(e) => setBlockName(e.target.value)}
              >
                <MenuItem value="A">A Blok</MenuItem>
                <MenuItem value="B">B Blok</MenuItem>
              </TextField>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: 'success.main' }}>
                KAYIT OL
              </Button>
              
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component="button" variant="body2" onClick={() => navigate('/')}>
                    Zaten hesabın var mı? Giriş Yap
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

export default Register;