import * as React from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

function CustomUsernameField() {
  return (
    <TextField
      id="input-with-icon-textfield"
      label="Username"
      name="username"
      type="text"
      size="small"
      required
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle fontSize="inherit" />
            </InputAdornment>
          ),
        },
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        size="small"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword ? (
                <VisibilityOff fontSize="inherit" />
              ) : (
                <Visibility fontSize="inherit" />
              )}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

function CustomButton() {
  return (
    <Button
      type="submit"
      variant="outlined"
      size="small"
      disableElevation
      fullWidth
      sx={{
        my: 2,
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
  );
}

function Title() {
  return <h2 style={{ marginBottom: 8, color: '#003285' }}>Login</h2>;
}

export default function LoginPage() {
  const theme = useTheme();
  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={() => {}}
        slots={{
          title: Title,
          emailField: CustomUsernameField,
          passwordField: CustomPasswordField,
          submitButton: CustomButton,
        }}
        slotProps={{ form: { noValidate: true } }}
        providers={providers}
      />
    </AppProvider>
  );
}