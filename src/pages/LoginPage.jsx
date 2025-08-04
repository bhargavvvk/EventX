import React, { useState, useCallback } from 'react';
import { getUserRole } from '../utils/auth';
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Paper,
  Container,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClickShowPassword = useCallback(() => {
    setShowPassword((show) => !show);
  }, []);

  const handleMouseDownPassword = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await axios.post('http://localhost:5001/api/auth/login', {
        username: form.username,
        password: form.password,
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const role = getUserRole();
      if(role === 'club-admin') {
        navigate('/add-event');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <AppProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <h2 style={{ marginBottom: 24, color: '#003285', textAlign: 'center' }}>Login</h2>
            
            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                id="username"
                label="Username"
                name="username"
                type="text"
                size="small"
                required
                fullWidth
                value={form.username}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle fontSize="inherit" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel size="small" htmlFor="outlined-adornment-password">
                  Password
                </InputLabel>
                <OutlinedInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  size="small"
                  value={form.password}
                  onChange={handleInputChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>

              <Button
                type="submit"
                variant="outlined"
                size="small"
                disableElevation
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: '#003285',
                  color: '#fff',
                  borderColor: '#003285',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#003285',
                    borderColor: '#003285',
                  },
                }}
              >
                Log In
              </Button>

              {error && (
                <div style={{ color: 'red', textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
                  {error}
                </div>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </AppProvider>
  );
}